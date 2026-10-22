const mongoose = require("mongoose");
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
      // Newest first. Messages from before timestamps existed still sort
      // correctly, since an ObjectId starts with its creation time.
      const contacts = query
        ? await Contact.find().sort({ _id: -1 }).limit(5)
        : await Contact.find().sort({ _id: -1 });
      res.status(200).json(contacts);
    } catch (err) {
      console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  });

// Mark a message dealt with (or not).
contactRouter.patch("/:id", verifyTokenAndAdmin, async (req, res) => {
    if (typeof req.body.handled !== "boolean") {
      return res.status(400).json({ error: "handled must be true or false." });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Message not found." });
    }
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: { handled: req.body.handled } },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: "Message not found." });
    }
    res.status(200).json(contact);
  });

module.exports = contactRouter