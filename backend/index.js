const app = require('./app');
const config = require('./utils/config')
const logger = require('./utils/logger')
const { startPaymentReconciler } = require('./utils/payments')
const mongoose = require('mongoose')
const Product = require('./models/product')
const { warmImageCache } = require('./controllers/img')

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
  startPaymentReconciler()
})

// Fetch every product photo into the image cache once the database is up,
// so visitors are not the ones waiting on Firebase.
mongoose.connection.once('open', async () => {
  try {
    const products = await Product.find({}, { img: 1 }).lean()
    warmImageCache(products.flatMap((p) => p.img || []))
  } catch (error) {
    logger.error('Could not warm the image cache:', error.message)
  }
})
