const { rateLimit } = require("express-rate-limit");
const Contact = require("../models/contact");
const contactRouter = require("express").Router();
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("./verifyToken");

// Anyone can write in, so cap how often and how much.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many messages. Please try again later." },
});

const CONTACT_LIMITS = { name: 100, email: 254, subject: 200, message: 5000 };

contactRouter.post('/', contactLimiter, async (req, res) => {
  const fields = {};
  for (const [field, max] of Object.entries(CONTACT_LIMITS)) {
    const value = req.body[field];
    if (typeof value !== "string" || !value.trim() || value.length > max) {
      return res.status(400).json({ error: `Please check the ${field} field.` });
    }
    fields[field] = value.trim();
  }
  const newContact = new Contact(fields);

  try {
    const savedContact = await newContact.save();
    res.status(200).json(savedContact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
  });

contactRouter.get("/", verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new;
    try {
      const contacts = query
        ? await Contact.find().sort({ _id: -1 }).limit(5)
        : await Contact.find();
      res.status(200).json(contacts);
    } catch (err) {
      console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

module.exports = contactRouter