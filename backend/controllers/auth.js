const bcrypt = require('bcrypt')
const crypto = require('crypto')
const authRouter = require('express').Router()
const { rateLimit } = require('express-rate-limit')
const { initializeApp, getApps } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = 10
// bcrypt only reads the first 72 bytes, so anything longer would silently
// ignore its tail.
const MIN_PASSWORD = 8
const MAX_PASSWORD = 72
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password guessing and account spam: per client address, across all of
// login, registration and Google sign-in.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
})
authRouter.use(authLimiter)

// Verifying a Google sign-in only needs Firebase's public keys, which are
// looked up by project id; no service account credentials are involved.
const firebaseAuth = () => {
  if (getApps().length === 0) {
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'kicksawa' })
  }
  return getAuth()
}

const isString = (value) => typeof value === 'string'

// Case-insensitive, so accounts saved before emails were lowercased still match.
const findByEmail = (email) =>
  User.findOne({ email: email.trim() }).collation({ locale: 'en', strength: 2 })

const sessionFor = (user) => {
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SEC,
    { expiresIn: 60 * 60, algorithm: 'HS256' }
  )
  return {
    token,
    email: user.email,
    name: user.username,
    isAdmin: user.isAdmin,
    phone: user.phone,
    location: user.location,
    id: user._id,
    profilePic: user.profilePicture,
  }
}

authRouter.post('/register', async (request, response) => {
  const { username, email, password } = request.body

  if (!isString(username) || username.trim().length < 2 || username.length > 50) {
    return response.status(400).json({ error: 'Names must be 2 to 50 characters.' })
  }
  if (!isString(email) || !EMAIL.test(email) || email.length > 254) {
    return response.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (!isString(password) || password.length < MIN_PASSWORD || Buffer.byteLength(password) > MAX_PASSWORD) {
    return response.status(400).json({ error: `Passwords must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.` })
  }

  if (await findByEmail(email)) {
    return response.status(400).json({ error: 'An account with this email already exists.' })
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = new User({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})


authRouter.post('/login', async (request, response) => {
  const { email, password } = request.body

  // Strings only: an object here (e.g. { "$ne": null }) would otherwise be
  // read by MongoDB as a query operator.
  if (!isString(email) || !isString(password)) {
    return response.status(401).json({ error: 'invalid email or password' })
  }

  const user = await findByEmail(email)
  const passwordCorrect = user === null || !user.passwordHash
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid email or password'
    })
  }

  // token expires in 60*60 seconds, that is, in one hour
  response.status(200).send(sessionFor(user))
})


// The client sends the ID token Firebase issued after Google sign-in. The
// email comes from that verified token, never from the request body: trusting
// a posted email let anyone sign in as any account.
authRouter.post('/google', async (req, res) => {
  const { idToken } = req.body
  if (!isString(idToken)) {
    return res.status(400).json({ error: 'Missing Google sign-in token.' })
  }

  let claims
  try {
    claims = await firebaseAuth().verifyIdToken(idToken)
  } catch (error) {
    console.error('Google token rejected:', error.code || error.message)
    return res.status(401).json({ error: 'Google sign-in could not be verified.' })
  }
  if (!claims.email || claims.email_verified !== true) {
    return res.status(401).json({ error: 'Your Google account email is not verified.' })
  }

  const email = claims.email.toLowerCase()
  let user = await findByEmail(email)
  if (!user) {
    const base = String(claims.name || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'
    user = await new User({
      username: `${base.slice(0, 40)}${crypto.randomInt(1000, 10000)}`,
      email,
      // No password: this account signs in through Google. A random hash
      // keeps password login closed rather than open.
      passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS),
      ...(isString(claims.picture) && claims.picture.startsWith('https://') && { profilePicture: claims.picture }),
    }).save()
  }

  res.status(200).json(sessionFor(user))
})


module.exports = authRouter;
