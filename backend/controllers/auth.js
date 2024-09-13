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
    .send({ token, email: user.email, name: user.username, isAdmin: user.isAdmin ,id:user._id,profilePic: user.profilePicture })
})


authRouter.post('/google',async (req,res)=>{
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SEC,
        { expiresIn: 60*60 }
      );
      // const { password, ...rest } = user._doc;
      res
        .status(200)
        .send({ token, email: user.email, name: user.username, isAdmin: user.isAdmin ,id:user._id,profilePic: user.profilePicture});
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hash(generatedPassword, 10);
      const newUser = new User({
        username:
          name.toLowerCase().split(' ').join('') +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SEC
      );
      // const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .send({ token, email: user.email, name: user.username, isAdmin: user.isAdmin ,id:user._id });
    }
  } catch (error) {
    console.log(error);
  }
})


module.exports = authRouter;