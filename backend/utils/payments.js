const Order = require('../models/order');
const mpesa = require('./mpesa');
const logger = require('./logger');

/**
 * Records an M-PESA outcome on an order. Every path that learns a result (the
 * status poll, Safaricom's callback, the background check) goes through here,
 * so they cannot disagree about what a result means.
 *
 * result: { status: 'success' | 'failed', resultCode, resultDesc,
 *           receipt?, paidAmount?, paidPhone? }
 */
const settlePayment = async (order, result) => {
  const outcome = {
    'payment.resultCode': result.resultCode,
    'payment.resultDesc': result.resultDesc,
  };

  if (result.status !== 'success') {
    // Only an unpaid order can fail; a late failure must not undo a payment.
    await Order.updateOne(
      { _id: order._id, 'payment.status': 'awaiting' },
      { $set: { ...outcome, 'payment.status': 'failed', status: 'cancelled' } }
    );
    return;
  }

  // Only the callback carries these. The poll can confirm a payment but not
  // give its receipt, so a callback after a poll still fills them in.
  const receipt = {
    ...(result.receipt && { 'payment.receipt': result.receipt }),
    ...(result.paidAmount !== undefined && { 'payment.paidAmount': result.paidAmount }),
    ...(result.paidPhone && { 'payment.paidPhone': String(result.paidPhone) }),
  };

  if (result.paidAmount !== undefined && result.paidAmount < order.amount) {
    logger.error(
      `Order ${order._id}: M-PESA paid ${result.paidAmount}, expected ${order.amount}. Needs review.`
    );
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          ...outcome,
          ...receipt,
          'payment.status': 'review',
          'payment.resultDesc': 'Payment received but the amount did not match. We will contact you.',
          status: 'pending',
        },
      }
    );
    return;
  }

  // 'failed' is included because a poll can time out before the customer
  // approves; if Safaricom later says the money arrived, the money wins.
  const settled = await Order.updateOne(
    { _id: order._id, 'payment.status': { $in: ['awaiting', 'failed'] } },
    {
      $set: {
        ...outcome,
        ...receipt,
        'payment.status': 'paid',
        'payment.paidAt': new Date(),
        status: 'processing',
      },
    }
  );
  if (settled.modifiedCount === 0 && Object.keys(receipt).length > 0) {
    await Order.updateOne({ _id: order._id }, { $set: receipt });
  }
};

/** Asks Safaricom about an unpaid order and records the answer if there is one. */
const refreshPayment = async (order) => {
  if (order.payment?.status !== 'awaiting' || !order.payment.checkoutRequestId) {
    return;
  }
  const result = await mpesa.stkQuery(order.payment.checkoutRequestId);
  if (result.status !== 'pending') {
    await settlePayment(order, result);
  }
};

const RECONCILE_EVERY_MS = 2 * 60 * 1000;
const SETTLE_AFTER_MS = 2 * 60 * 1000; // Leave fresh prompts to the customer.
const ABANDON_AFTER_MS = 10 * 60 * 1000;

/**
 * Safety net for missed callbacks and closed tabs: periodically asks Safaricom
 * about orders that have been unpaid for a while.
 */
const reconcileUnpaidOrders = async () => {
  const now = Date.now();

  // The prompt never went out (the server stopped between saving the order
  // and reaching Safaricom), so nothing can ever settle these.
  await Order.updateMany(
    {
      'payment.status': 'awaiting',
      'payment.checkoutRequestId': { $exists: false },
      createdAt: { $lt: new Date(now - ABANDON_AFTER_MS) },
    },
    { $set: { 'payment.status': 'failed', 'payment.resultDesc': 'Payment was never started', status: 'cancelled' } }
  );

  const stale = await Order.find({
    'payment.status': 'awaiting',
    'payment.checkoutRequestId': { $exists: true },
    createdAt: { $lt: new Date(now - SETTLE_AFTER_MS), $gt: new Date(now - 24 * 60 * 60 * 1000) },
  }).limit(20);

  for (const order of stale) {
    try {
      await refreshPayment(order);
    } catch (error) {
      logger.error(`Could not reconcile order ${order._id}:`, error.response?.data || error.message);
    }
  }
};

const startPaymentReconciler = () => {
  const timer = setInterval(() => {
    reconcileUnpaidOrders().catch((error) => logger.error('Payment reconciler failed:', error.message));
  }, RECONCILE_EVERY_MS);
  timer.unref();
  return timer;
};

module.exports = {
  settlePayment,
  refreshPayment,
  reconcileUnpaidOrders,
  startPaymentReconciler,
};
