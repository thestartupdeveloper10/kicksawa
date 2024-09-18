const bcrypt = require('bcrypt')
const authRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')


authRouter.post('/register', async (request, response) => {
  const { username, email, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    email,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})


authRouter.post('/login', async (request, response) => {
  const { email, password } = request.body

  const user = await User.findOne({ email })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid email or password'
    })
  }

  const userForToken = {
    id: user._id,
    isAdmin: user.isAdmin, 
  }

  // token expires in 60*60 seconds, that is, in one hour
  const token = jwt.sign(   
     userForToken,
     process.env.JWT_SEC,
     { expiresIn: 60*60 }  
    )

  response
    .status(200)
    .send({ token, email: user.email, name: user.username, isAdmin: user.isAdmin,phone: user.phone,location: user.location,id:user._id,profilePic: user.profilePicture })
})


authRouter.post('/google', async (req, res) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SEC,
        { expiresIn: '1h' }
      );
      res.status(200).json({
        token,
        email: user.email,
        name: user.username,
        phone: user.phone,
        location: user.location,
        isAdmin: user.isAdmin,
        id: user._id,
        profilePic: user.profilePicture
      });
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      const newUser = new User({
        username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
        email: email,
        passwordHash: hashedPassword,
        profilePicture: googlePhotoUrl,
        phone: `Google-${Math.random().toString(36).slice(-8)}`, // Generate a unique phone placeholder
      });
      user = await newUser.save();
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SEC,
        { expiresIn: '1h' }
      );
      res.status(200).json({
        token,
        email: user.email,
        name: user.username,
        phone: user.phone,
        location: user.location,
        isAdmin: user.isAdmin,
        id: user._id,
        profilePic: user.profilePicture
      });
    }
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ error: 'An error occurred during authentication' });
  }
});


module.exports = authRouter;