const Contact = require("../models/contact");
const contactRouter = require("express").Router();
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("./verifyToken");

contactRouter.post('/contact',verifyToken, async (req, res) => {
    try {
        const contactData = new Contact({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message:req.body.message
        });
  
        await Contact.create(contactData);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });