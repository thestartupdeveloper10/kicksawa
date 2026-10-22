const logger = require('./logger')

// Never echo credentials into the logs.
const SENSITIVE = new Set(['password', 'confirmPassword', 'token'])

const redact = (body) => {
  if (!body || typeof body !== 'object') return body
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key, SENSITIVE.has(key) ? '[redacted]' : value])
  )
}

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', redact(request.body))
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({
      error: 'expected `username` to be unique'
    })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })

  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  // Anything unexpected: the details belong in the log above, not in a
  // response a stranger can read.
  if (response.headersSent) {
    return next(error)
  }
  response.status(500).json({ error: 'Something went wrong. Please try again.' })
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}