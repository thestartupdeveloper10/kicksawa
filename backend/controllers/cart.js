const mongoose = require("mongoose");
const Cart = require("../models/cart");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const cartRouter = require("express").Router();

// A cart belongs to the signed-in user. The old routes took userId from the
// request body and compared the cart id against the user id, so a cart could
// be created for anyone and only admins could ever edit one.

const cleanProducts = (products) => {
  if (!Array.isArray(products) || products.length > 50) return null;
  const clean = [];
  for (const item of products) {
    const quantity = Number(item?.quantity ?? 1);
    if (typeof item?.productId !== "string" || item.productId.length > 64
      || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return null;
    }
    clean.push({ productId: item.productId, quantity });
  }
  return clean;
};

/** Loads a cart the caller may change: their own, or any for an admin. */
const ownCart = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ error: "Cart not found." });
    return null;
  }
  const cart = await Cart.findById(req.params.id);
  if (!cart || (cart.userId !== req.user.id && !req.user.isAdmin)) {
    res.status(404).json({ error: "Cart not found." });
    return null;
  }
  return cart;
};

//CREATE

cartRouter.post("/", verifyToken, async (req, res) => {
  const products = cleanProducts(req.body.products ?? []);
  if (!products) {
    return res.status(400).json({ error: "Invalid cart contents." });
  }
  const savedCart = await new Cart({ userId: req.user.id, products }).save();
  res.status(200).json(savedCart);
});

//UPDATE

cartRouter.put("/:id", verifyToken, async (req, res) => {
  const cart = await ownCart(req, res);
  if (!cart) return;
  const products = cleanProducts(req.body.products);
  if (!products) {
    return res.status(400).json({ error: "Invalid cart contents." });
  }
  cart.products = products;
  res.status(200).json(await cart.save());
});

//DELETE

cartRouter.delete("/:id", verifyToken, async (req, res) => {
  const cart = await ownCart(req, res);
  if (!cart) return;
  await cart.deleteOne();
  res.status(200).json("Cart has been deleted...");
});

//GET USER CART

cartRouter.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// //GET ALL

cartRouter.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = cartRouter;