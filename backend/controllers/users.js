const bcrypt = require('bcrypt')
const User = require("../models/user");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const usersRouter = require("express").Router();

//UPDATE

// The only fields a profile edit may touch. Everything else on the user
// (isAdmin, passwordHash, timestamps) is out of reach of this route: it used
// to $set the whole request body, which let anyone make themselves an admin.
const PROFILE_FIELDS = {
  username: { max: 50, min: 2 },
  email: { max: 254, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { max: 30 },
  location: { max: 100 },
  profilePicture: { max: 2048, pattern: /^https:\/\// },
};
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72;

usersRouter.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const changes = {};
  for (const [field, rule] of Object.entries(PROFILE_FIELDS)) {
    if (req.body[field] === undefined) continue;
    const value = req.body[field];
    if (typeof value !== "string" || value.trim().length > rule.max
      || (rule.min && value.trim().length < rule.min)
      || (rule.pattern && !rule.pattern.test(value.trim()))) {
      return res.status(400).json({ error: `Invalid ${field}.` });
    }
    changes[field] = value.trim();
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Changing a password needs the current one, so a stolen session cannot
  // lock the owner out. The old code hashed the new password and then threw
  // the hash away.
  if (req.body.newPassword !== undefined) {
    const { currentPassword, newPassword } = req.body;
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD
      || Buffer.byteLength(newPassword) > MAX_PASSWORD) {
      return res.status(400).json({ error: `Passwords must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.` });
    }
    const currentOk = typeof currentPassword === "string" && user.passwordHash
      && await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentOk) {
      return res.status(403).json({ error: "Your current password is incorrect." });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  user.set(changes);
  try {
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "That name or email is already in use." });
    }
    throw err;
  }
});

//DELETE

usersRouter.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

//GET USER

usersRouter.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // toJSON drops passwordHash; spreading _doc (as before) sent it along.
    res.status(200).json(user.toJSON());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

//GET ALL USER

usersRouter.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

//GET USER STATS

usersRouter.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = usersRouter;