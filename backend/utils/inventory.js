const Product = require('../models/product');
const Order = require('../models/order');
const logger = require('./logger');

/*
 * Stock is held when an order is created, not when it is paid: the customer
 * has a minute or two to approve the M-PESA prompt, and holding the pair
 * through that window is what stops two people paying for the last one.
 * A hold is released when the payment fails or expires, or an admin cancels
 * the order; a paid order keeps it.
 *
 * Every change to a count is a single conditional update on the product, so
 * concurrent checkouts cannot take the same pair. Each also bumps __v, which
 * lets the admin editor detect that stock moved while it was open.
 */

const isTracked = (product) => Array.isArray(product?.stock) && product.stock.length > 0;

const sameSize = (a, b) =>
  String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

/** The product's own stock entry for a requested size, or undefined. */
const stockEntryFor = (product, size) => product.stock.find((entry) => sameSize(entry.size, size));

/** Recomputes inStock from the counts, for tracked products only. */
const syncInStock = async (productIds) => {
  const ids = [...new Set(productIds.map(String))];
  await Promise.all(
    ids.map((id) =>
      Product.updateOne({ _id: id, 'stock.0': { $exists: true } }, [
        {
          $set: {
            inStock: {
              $anyElementTrue: [{ $map: { input: '$stock', in: { $gt: ['$$this.quantity', 0] } } }],
            },
          },
        },
      ])
    )
  );
};

/** Folds lines for the same product and size (e.g. two colours) into one hold. */
const holdsFor = (lines) => {
  const byKey = new Map();
  lines
    .filter((line) => line.tracked)
    .forEach((line) => {
      const key = `${line.productId}|${line.stockSize}`;
      const held = byKey.get(key);
      if (held) held.quantity += line.quantity;
      else byKey.set(key, { productId: line.productId, size: line.stockSize, quantity: line.quantity });
    });
  return [...byKey.values()];
};

const returnStock = async (holds) => {
  for (const hold of holds) {
    const result = await Product.updateOne(
      { _id: hold.productId, 'stock.size': hold.size },
      { $inc: { 'stock.$.quantity': hold.quantity, __v: 1 } }
    );
    if (result.modifiedCount === 0) {
      // The size was removed while the pair was held; nothing to put it back into.
      logger.error(`Could not return ${hold.quantity} of ${hold.productId} size "${hold.size}" to stock`);
    }
  }
  await syncInStock(holds.map((hold) => hold.productId));
};

/**
 * Takes every hold or none. Resolves { ok: true } or { ok: false, failed }
 * naming the first hold there was not enough stock for.
 */
const takeStock = async (holds) => {
  const taken = [];
  for (const hold of holds) {
    const result = await Product.updateOne(
      {
        _id: hold.productId,
        stock: { $elemMatch: { size: hold.size, quantity: { $gte: hold.quantity } } },
      },
      { $inc: { 'stock.$.quantity': -hold.quantity, __v: 1 } }
    );
    if (result.modifiedCount === 0) {
      // MongoDB has no multi-document atomicity here without a replica-set
      // transaction, so undo what this checkout already took.
      await returnStock(taken);
      return { ok: false, failed: hold };
    }
    taken.push(hold);
  }
  await syncInStock(holds.map((hold) => hold.productId));
  return { ok: true };
};

/** Releases an order's hold exactly once, however many paths ask. */
const releaseOrderStock = async (order) => {
  const flipped = await Order.updateOne(
    { _id: order._id, 'inventory.status': 'held' },
    { $set: { 'inventory.status': 'released' } }
  );
  if (flipped.modifiedCount > 0) {
    await returnStock(order.inventory.held);
  }
};

/**
 * For a payment that arrives after its order was given up on: take the stock
 * back if it is still there. Resolves false if it has sold in the meantime.
 */
const reholdOrderStock = async (order) => {
  if (order.inventory?.status !== 'released') return true;
  const taken = await takeStock(order.inventory.held);
  if (!taken.ok) return false;
  const flipped = await Order.updateOne(
    { _id: order._id, 'inventory.status': 'released' },
    { $set: { 'inventory.status': 'held' } }
  );
  if (flipped.modifiedCount === 0) {
    // Another path re-held it first; give back this second copy.
    await returnStock(order.inventory.held);
  }
  return true;
};

module.exports = {
  isTracked,
  stockEntryFor,
  syncInStock,
  holdsFor,
  takeStock,
  returnStock,
  releaseOrderStock,
  reholdOrderStock,
};
