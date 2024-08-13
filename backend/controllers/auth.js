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
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
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
    .send({ token, username: user.username, name: user.name, isAdmin: user.isAdmin ,id:user._id })
})



module.exports = authRouter;