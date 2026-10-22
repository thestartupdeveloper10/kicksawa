const Product = require("../models/product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const productRouter = require("express").Router();

const MAX_STOCK = 100000;

const sameSize = (a, b) =>
  String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();

/**
 * Checks a product's stock against its sizes. Resolves to { error } or
 * { stock }, where stock uses the catalogue's own size spellings and is
 * undefined for an untracked product.
 */
const checkStock = (stock, sizes) => {
  if (stock === undefined || stock === null || (Array.isArray(stock) && stock.length === 0)) {
    return { stock: undefined };
  }
  if (!Array.isArray(stock)) {
    return { error: "Stock must be a list of sizes and quantities." };
  }

  const cleanSizes = (sizes || []).map((size) => String(size).trim()).filter(Boolean);
  const entries = [];
  for (const entry of stock) {
    const quantity = Number(entry?.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_STOCK) {
      return { error: `Stock quantities must be whole numbers from 0 to ${MAX_STOCK}.` };
    }
    let size = "";
    if (cleanSizes.length > 0) {
      size = cleanSizes.find((option) => sameSize(option, entry?.size));
      if (size === undefined) {
        return { error: `Stock lists size "${entry?.size}", which this product does not have.` };
      }
    } else if (String(entry?.size ?? "").trim() !== "") {
      return { error: "This product has no sizes, so its stock is a single quantity." };
    }
    if (entries.some((existing) => sameSize(existing.size, size))) {
      return { error: size ? `Size ${size} is listed twice in stock.` : "Stock is listed twice." };
    }
    entries.push({ size, quantity });
  }
  return { stock: entries };
};

/** A tracked product is in stock exactly when some size has pairs left. */
const deriveInStock = (product) => {
  if (Array.isArray(product.stock) && product.stock.length > 0) {
    product.inStock = product.stock.some((entry) => entry.quantity > 0);
  }
};

//CREATE

productRouter.post("/", verifyTokenAndAdmin, async (req, res) => {
  const { stock, error } = checkStock(req.body.stock, req.body.size);
  if (error) {
    return res.status(400).json({ error });
  }
  const newProduct = new Product({ ...req.body, stock });
  deriveInStock(newProduct);

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE

productRouter.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  const { __v, _id, createdAt, updatedAt, ...changes } = req.body;
  // Checkouts change stock while the editor is open. An editor that sends
  // the version it loaded is refused if anything has moved since, rather
  // than writing its stale counts over real sales.
  if (__v !== undefined && Number(__v) !== product.__v) {
    return res.status(409).json({
      error: "This product changed while you were editing (stock may have sold). Reload it and try again.",
    });
  }

  product.set(changes);
  const { stock, error } = checkStock(
    "stock" in changes ? changes.stock : product.stock?.toObject?.() ?? product.stock,
    product.size
  );
  if (error) {
    return res.status(400).json({ error });
  }
  product.stock = stock;
  deriveInStock(product);
  product.increment();

  try {
    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE

productRouter.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT

productRouter.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS

productRouter.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const qBrand = req.query.brand;
  const qSearch = req.query.search;

  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(5);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else if (qBrand) {
      products = await Product.find({ brand: qBrand });
    } else if (qSearch) {
      products = await Product.find({
        $or: [
          { title: { $regex: qSearch, $options: 'i' } },
          { brand: { $regex: qSearch, $options: 'i' } },
          { categories: { $in: [new RegExp(qSearch, 'i')] } }
        ]
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = productRouter;