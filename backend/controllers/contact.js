const Contact = require("../models/contact");
const contactRouter = require("express").Router();
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("./verifyToken");

contactRouter.post('/',verifyToken, async (req, res) => {
  const newContact = new Contact(req.body);

  try {
    const savedContact = await newContact.save();
    res.status(200).json(savedContact);
  } catch (err) {
    res.status(500).json(err);
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
      res.status(500).json(err);
    }
  });

module.exports = contactRouter