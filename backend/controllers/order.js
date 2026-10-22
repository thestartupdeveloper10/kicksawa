const crypto = require("crypto");
const mongoose = require("mongoose");
const { rateLimit } = require("express-rate-limit");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const Contact = require("../models/contact");
const config = require("../utils/config");
const mpesa = require("../utils/mpesa");
const { refreshPayment } = require("../utils/payments");
const inventory = require("../utils/inventory");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const orderRouter = require("express").Router();

const MAX_LINES = 50;
const MAX_QUANTITY = 10; // Same cap the bag enforces per line.

// Each checkout sends a prompt to a real handset, so cap how often one
// account can do it. Status polling is cheaper but still calls Safaricom.
const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  // Only attempts that sent a new prompt (201) count: not a mistyped number,
  // and not a retry that replayed an earlier attempt.
  skipFailedRequests: true,
  requestWasSuccessful: (req, res) => res.statusCode === 201,
  keyGenerator: (req) => req.user.id,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many payment attempts. Please wait a few minutes and try again." },
});

const statusLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  keyGenerator: (req) => req.user.id,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests." },
});

const sameOption = (a, b) =>
  String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();

/**
 * Turns what the client asked for into priced order lines using the catalogue,
 * never the client's own prices. Returns { lines } or { error }.
 */
const priceItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) {
    return { error: "Your bag is empty." };
  }

  for (const item of items) {
    if (!mongoose.isValidObjectId(item?.productId)) {
      return { error: "Your bag contains an item we could not find." };
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      return { error: `Quantities must be between 1 and ${MAX_QUANTITY}.` };
    }
  }

  const ids = [...new Set(items.map((item) => String(item.productId)))];
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((product) => [String(product._id), product]));

  const lines = [];
  for (const item of items) {
    const product = byId.get(String(item.productId));
    if (!product) {
      return { error: "Your bag contains an item that is no longer available." };
    }
    if (!product.inStock) {
      return { error: `${product.title} is out of stock.` };
    }

    const sizes = product.size || [];
    // Keep the catalogue's own spelling of the size, so stock lookups and the
    // order agree with what the admin entered.
    const size = sizes.find((option) => sameOption(option, item.size));
    if (sizes.length > 0 && size === undefined) {
      return { error: `Choose an available size for ${product.title}.` };
    }

    const tracked = inventory.isTracked(product);
    const stockEntry = tracked ? inventory.stockEntryFor(product, size ?? "") : null;
    if (tracked && !(stockEntry?.quantity > 0)) {
      return {
        error: size
          ? `${product.title} in size ${size} is sold out.`
          : `${product.title} is sold out.`,
      };
    }
    const colors = product.color || [];
    if (colors.length > 0 && item.color && !colors.some((color) => sameOption(color, item.color))) {
      return { error: `Choose an available colour for ${product.title}.` };
    }

    lines.push({
      productId: String(product._id),
      quantity: item.quantity,
      title: product.title,
      size: size !== undefined ? String(size) : undefined,
      color: item.color ? String(item.color).trim().toLowerCase() : undefined,
      unitPrice: product.price,
      // Not saved on the order; used to work out what to hold.
      tracked,
      stockSize: stockEntry?.size,
    });
  }

  return { lines };
};

const IDEMPOTENCY_KEY = /^[A-Za-z0-9_-]{16,100}$/;

/** A stable hash of what the customer asked for, independent of key order. */
const fingerprintOf = ({ items, details, msisdn }) => {
  const normalized = (Array.isArray(items) ? items : [])
    .map((item) => [
      String(item?.productId ?? ""),
      Number(item?.quantity),
      String(item?.size ?? "").trim().toLowerCase(),
      String(item?.color ?? "").trim().toLowerCase(),
    ])
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ items: normalized, details, msisdn }))
    .digest("hex");
};

const PUSH_FAILED = { error: "Something went wrong reaching M-PESA. Please try again." };

/** Answers a retried checkout with what the first attempt produced. */
const replayCheckout = (res, order, fingerprint) => {
  res.set("Idempotent-Replayed", "true");
  if (order.idempotencyFingerprint !== fingerprint) {
    return res.status(422).json({
      error: "This checkout was already submitted with different details. Please try again.",
    });
  }
  if (order.payment?.status === "failed" && !order.payment.checkoutRequestId) {
    return res.status(502).json(PUSH_FAILED);
  }
  return res.status(200).json({
    orderId: order._id,
    amount: order.amount,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
  });
};

// CHECKOUT
// The server prices the order, saves it as unpaid, then asks M-PESA for
// exactly that amount. The client only learns the outcome through /:id/status.
// Requires an Idempotency-Key header: resending the same key (a double tap,
// a retry after a dropped connection) returns the original order instead of
// prompting the customer's phone a second time.

orderRouter.post("/checkout", verifyToken, checkoutLimiter, async (req, res) => {
  const { items, address, phone } = req.body;

  const idempotencyKey = req.get("Idempotency-Key");
  if (!idempotencyKey || !IDEMPOTENCY_KEY.test(idempotencyKey)) {
    return res.status(400).json({ error: "Missing or malformed Idempotency-Key header." });
  }

  const msisdn = mpesa.normalizePhone(phone);
  if (!msisdn) {
    return res.status(400).json({ error: "Enter a valid Safaricom number, e.g. 0712 345 678." });
  }
  const details = typeof address === "string" ? address.trim() : "";
  if (details.length < 6 || details.length > 500) {
    return res.status(400).json({ error: "Add a delivery address we can find." });
  }

  const fingerprint = fingerprintOf({ items, details, msisdn });
  const previous = await Order.findOne({ userId: req.user.id, idempotencyKey });
  if (previous) {
    return replayCheckout(res, previous, fingerprint);
  }

  const { lines, error } = await priceItems(items);
  if (error) {
    return res.status(400).json({ error });
  }

  // Hold the pairs before the order exists, so the last one cannot go to two
  // customers who are both waiting on their phones.
  const holds = inventory.holdsFor(lines);
  const taken = await inventory.takeStock(holds);
  if (!taken.ok) {
    const line = lines.find((l) => l.productId === taken.failed.productId);
    const label = taken.failed.size ? `${line.title} in size ${taken.failed.size}` : line.title;
    return res.status(409).json({
      error: `Not enough of ${label} left for your bag. Please lower the quantity or choose another size.`,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const deliveryFee = subtotal >= config.FREE_DELIVERY_THRESHOLD ? 0 : config.DELIVERY_FEE;
  // M-PESA only takes whole shillings.
  const amount = Math.round(subtotal + deliveryFee);

  let order;
  try {
    order = await Order.create({
      userId: req.user.id,
      idempotencyKey,
      idempotencyFingerprint: fingerprint,
      products: lines.map(({ tracked, stockSize, ...line }) => line),
      inventory: { status: holds.length > 0 ? "held" : "none", held: holds },
      subtotal,
      deliveryFee,
      amount,
      address: { details },
      payment: { method: "mpesa", status: "awaiting", phone: msisdn },
    });
  } catch (err) {
    // No order means nothing holds these pairs; put them straight back.
    await inventory.returnStock(holds);
    // Two requests with the same key raced past the lookup above; the unique
    // index let exactly one create the order, so answer as its replay.
    if (err.code === 11000) {
      const winner = await Order.findOne({ userId: req.user.id, idempotencyKey });
      if (winner) return replayCheckout(res, winner, fingerprint);
    }
    throw err;
  }

  try {
    const push = await mpesa.stkPush({
      phone: msisdn,
      amount,
      reference: `KICKSAWA-${String(order._id).slice(-8).toUpperCase()}`,
      description: "Kicksawa order",
    });
    if (!push.CheckoutRequestID) {
      throw new Error(push.errorMessage || "No CheckoutRequestID in STK push response");
    }

    order.payment.checkoutRequestId = push.CheckoutRequestID;
    await order.save();

    return res.status(201).json({ orderId: order._id, amount, subtotal, deliveryFee });
  } catch (err) {
    console.error("STK push failed:", err.response?.data || err.message);
    order.payment.status = "failed";
    order.payment.resultDesc = "Could not reach M-PESA";
    order.status = "cancelled";
    await order.save();
    await inventory.releaseOrderStock(order);
    return res.status(502).json(PUSH_FAILED);
  }
});

// PAYMENT STATUS
// The order's state is set by the server (callback, or a query to Safaricom
// while it is still unpaid), never reported by the client.

orderRouter.get("/:id/status", verifyToken, statusLimiter, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Order not found." });
  }
  const order = await Order.findById(req.params.id);
  if (!order || (order.userId !== req.user.id && !req.user.isAdmin)) {
    return res.status(404).json({ error: "Order not found." });
  }

  // The callback usually gets there first; this covers it not arriving.
  await refreshPayment(order);
  const current = await Order.findById(order._id);

  res.json({
    paymentStatus: current.payment?.status || "awaiting",
    resultDesc: current.payment?.resultDesc,
    receipt: current.payment?.receipt,
    amount: current.amount,
  });
});

//CREATE
// Admin only: customers create orders through /checkout, which prices them.

orderRouter.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

//UPDATE

orderRouter.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    // Payment and stock records are the server's to keep; an edit cannot
    // rewrite them.
    const { payment, inventory: _inventory, idempotencyKey, idempotencyFingerprint, ...changes } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: changes,
      },
      { new: true }
    );
    // Cancelling puts the pairs back on the shelf (once, however often it is
    // cancelled).
    if (updatedOrder && changes.status === "cancelled") {
      await inventory.releaseOrderStock(updatedOrder);
    }
    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

//DELETE

orderRouter.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

//GET USER ORDERS

orderRouter.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// //GET ALL

orderRouter.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Orders that brought money in. Orders from before payments were tracked
// have no payment record; the old flow only created them once paid.
const PAID = { $or: [{ "payment.status": "paid" }, { payment: { $exists: false } }] };

const DAY_MS = 24 * 60 * 60 * 1000;
const LOW_STOCK = 2;

// DASHBOARD SUMMARY
// Everything the admin dashboard shows, in one round trip.

orderRouter.get("/summary", verifyTokenAndAdmin, async (req, res) => {
  const now = Date.now();
  const since = new Date(now - 30 * DAY_MS);
  const before = new Date(now - 60 * DAY_MS);

  const [revenueByDay, windows, toShip, awaiting, review, customers, newCustomers, stock, unhandledMessages] =
    await Promise.all([
      Order.aggregate([
        { $match: { ...PAID, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $ifNull: ["$payment.paidAt", "$createdAt"] },
                timezone: "Africa/Nairobi",
              },
            },
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { ...PAID, createdAt: { $gte: before } } },
        {
          $group: {
            _id: { $cond: [{ $gte: ["$createdAt", since] }, "current", "previous"] },
            revenue: { $sum: "$amount" },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.countDocuments({ ...PAID, status: { $in: ["pending", "processing"] } }),
      Order.countDocuments({ "payment.status": "awaiting" }),
      Order.countDocuments({ "payment.status": "review" }),
      User.countDocuments({ isAdmin: { $ne: true } }),
      User.countDocuments({ isAdmin: { $ne: true }, createdAt: { $gte: since } }),
      Product.aggregate([
        { $unwind: "$stock" },
        {
          $group: {
            _id: null,
            lowSizes: { $sum: { $cond: [{ $and: [{ $gt: ["$stock.quantity", 0] }, { $lte: ["$stock.quantity", LOW_STOCK] }] }, 1, 0] } },
            soldOutSizes: { $sum: { $cond: [{ $eq: ["$stock.quantity", 0] }, 1, 0] } },
            pairs: { $sum: "$stock.quantity" },
          },
        },
      ]),
      Contact.countDocuments({ handled: { $ne: true } }),
    ]);

  const window = (id) => windows.find((w) => w._id === id) || { revenue: 0, orders: 0 };
  res.json({
    revenueByDay: revenueByDay.map((d) => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
    revenue30: window("current").revenue,
    orders30: window("current").orders,
    revenuePrev30: window("previous").revenue,
    toShip,
    awaitingPayment: awaiting,
    needsReview: review,
    customers,
    newCustomers30: newCustomers,
    lowStockSizes: stock[0]?.lowSizes ?? 0,
    soldOutSizes: stock[0]?.soldOutSizes ?? 0,
    pairsOnHand: stock[0]?.pairs ?? 0,
    unhandledMessages,
    lowStockThreshold: LOW_STOCK,
  });
});

// RESOLVE A PAYMENT REVIEW
// 'review' means money arrived but something did not line up (short
// payment, or paid after the pairs had sold). A person decides: treat it as
// paid and fulfil, or record that the money was returned.

orderRouter.post("/:id/resolve-review", verifyTokenAndAdmin, async (req, res) => {
  const { resolution, note } = req.body;
  if (!["paid", "refunded"].includes(resolution)) {
    return res.status(400).json({ error: "Choose whether to mark this paid or refunded." });
  }
  if (note !== undefined && (typeof note !== "string" || note.length > 500)) {
    return res.status(400).json({ error: "Notes are limited to 500 characters." });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Order not found." });
  }

  const review = {
    "payment.review": { resolution, note: note?.trim() || undefined, by: req.user.id, at: new Date() },
  };
  const changes = resolution === "paid"
    ? { "payment.status": "paid", "payment.paidAt": new Date(), status: "processing" }
    : { "payment.status": "refunded", status: "cancelled" };

  // Conditional on still being in review, so two admins cannot both resolve it.
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, "payment.status": "review" },
    { $set: { ...changes, ...review } },
    { new: true }
  );
  if (!order) {
    const exists = await Order.exists({ _id: req.params.id });
    return exists
      ? res.status(409).json({ error: "This order is not awaiting review." })
      : res.status(404).json({ error: "Order not found." });
  }

  let warning;
  if (resolution === "paid") {
    // Paid after its pairs were released: take them back if they are still here.
    if (!(await inventory.reholdOrderStock(order))) {
      warning = "Some items have sold out since. Restock them or contact the customer before shipping.";
    }
  } else {
    await inventory.releaseOrderStock(order);
  }

  res.json({ order: await Order.findById(order._id), warning });
});

// GET MONTHLY INCOME
// Paid orders only; unpaid and failed checkouts are not income.

orderRouter.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          ...PAID,
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// //GET ALL

orderRouter.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find().count();
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});


module.exports = orderRouter;