require('dotenv').config()

const PORT = process.env.PORT


const MONGODB_URI = process.env.MONGODB_URI

// Must match kicksawa/src/lib/site.js, which shows the same figures in the bag.
// The server's numbers are the ones actually charged.
const DELIVERY_FEE = 200
const FREE_DELIVERY_THRESHOLD = 10000

module.exports = {
  MONGODB_URI,
  PORT,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD
}
