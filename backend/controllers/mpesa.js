const mpesaRouter = require("express").Router();
const crypto = require('crypto');
const Order = require('../models/order');
const { generateQr } = require('../utils/mpesa');
const { settlePayment } = require('../utils/payments');
const logger = require('../utils/logger');
const { verifyTokenAndAdmin } = require('./verifyToken');

// STK pushes are no longer exposed here: they take their amount from the
// order, which the server prices itself (see POST /api/orders/checkout).

const keyMatches = (given) => {
  const expected = process.env.MPESA_CALLBACK_SECRET;
  if (!expected || typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const ACCEPTED = { ResultCode: 0, ResultDesc: 'Accepted' };

// STK result callback, called by Safaricom rather than the browser.
// Safaricom only needs an acknowledgement, so anything we cannot use is
// logged and still acknowledged; the background check settles stragglers.
mpesaRouter.post('/mpesa/callback', async (req, res) => {
  if (!keyMatches(req.query.key)) {
    return res.status(404).json({ error: 'unknown endpoint' });
  }

  const callback = req.body?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) {
    logger.error('M-PESA callback without a CheckoutRequestID');
    return res.json(ACCEPTED);
  }

  const order = await Order.findOne({ 'payment.checkoutRequestId': callback.CheckoutRequestID });
  if (!order) {
    logger.error(`M-PESA callback for unknown CheckoutRequestID ${callback.CheckoutRequestID}`);
    return res.json(ACCEPTED);
  }

  const meta = Object.fromEntries(
    (callback.CallbackMetadata?.Item || []).map((item) => [item.Name, item.Value])
  );
  const resultCode = String(callback.ResultCode);

  await settlePayment(order, {
    status: resultCode === '0' ? 'success' : 'failed',
    resultCode,
    resultDesc: callback.ResultDesc,
    receipt: meta.MpesaReceiptNumber,
    paidAmount: meta.Amount !== undefined ? Number(meta.Amount) : undefined,
    paidPhone: meta.PhoneNumber,
  });

  res.json(ACCEPTED);
});

// QR code generation endpoint. Admin only, since it asks Safaricom for a
// payment code of any amount.
mpesaRouter.post('/generate-qr', verifyTokenAndAdmin, async (req, res) => {
  const { amount, accountReference, transactionDesc } = req.body;
  try {
    res.json(await generateQr({ amount, accountReference, transactionDesc }));
  } catch (error) {
    // Safaricom's error body stays in the server log, not the response.
    logger.error('QR generation failed:', error.response?.data || error.message);
    res.status(502).json({ error: 'Could not generate a QR code right now.' });
  }
});

module.exports = mpesaRouter;
