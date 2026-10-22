const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    method: { type: String, default: "mpesa" },
    status: {
      type: String,
      // review: money arrived but did not match the order; needs a person.
      // refunded: an admin resolved a review by returning the money.
      enum: ["awaiting", "paid", "failed", "review", "refunded"],
      default: "awaiting",
    },
    phone: { type: String },
    checkoutRequestId: { type: String, index: true },
    resultCode: { type: String },
    resultDesc: { type: String },
    // From Safaricom's callback; what reconciliation and refunds go by.
    receipt: { type: String },
    paidAmount: { type: Number },
    paidPhone: { type: String },
    paidAt: { type: Date },
    // How an admin settled a 'review' payment, and who did it.
    review: {
      resolution: { type: String, enum: ["paid", "refunded"] },
      note: { type: String },
      by: { type: String },
      at: { type: Date },
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    products: [
      {
        productId: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        // Snapshotted at checkout so the order still says what was bought,
        // and for how much, after the catalogue changes.
        title: { type: String },
        size: { type: String },
        color: { type: String },
        unitPrice: { type: Number },
      },
    ],
    // The client's Idempotency-Key for the checkout that created this order,
    // and a hash of what was asked for, so a retried request is recognised
    // and a reused key with different contents is refused.
    idempotencyKey: { type: String },
    idempotencyFingerprint: { type: String },
    subtotal: { type: Number },
    deliveryFee: { type: Number },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    // Stock this order took from tracked products (see utils/inventory.js).
    // 'none' when nothing it contains is tracked.
    inventory: {
      status: { type: String, enum: ["none", "held", "released"], default: "none" },
      held: [
        {
          _id: false,
          productId: { type: String },
          size: { type: String },
          quantity: { type: Number },
        },
      ],
    },
    // Fulfilment: pending -> processing -> shipped -> delivered, or cancelled.
    status: { type: String, default: "pending" },
    // Money, tracked apart from fulfilment so an unpaid order is never
    // mistaken for one waiting to ship. A sub-document rather than a nested
    // object so an order without one (placed before payments were tracked)
    // stays without one: nested defaults would report it as 'awaiting'.
    payment: { type: PaymentSchema, default: undefined },
  },
  { timestamps: true }
);

// One order per key per customer. Partial, because orders placed before keys
// existed have none.
OrderSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $exists: true } } }
);

module.exports = mongoose.model("Order", OrderSchema);
