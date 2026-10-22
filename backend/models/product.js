const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: Array, required: true },
    brand: { type: String, required: true },
    categories: { type: Array },
    size: { type: Array },
    color: { type: Array },
    price: { type: Number, required: true },
    // Pairs on hand per size; a product without sizes keeps one entry with
    // size ''. Left unset, the product is untracked and inStock is the manual
    // switch it always was. Once set, inStock is derived from it.
    stock: {
      type: [
        {
          _id: false,
          size: { type: String, default: "" },
          quantity: { type: Number, min: 0, default: 0 },
        },
      ],
      default: undefined,
    },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);