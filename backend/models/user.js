const mongoose = require('mongoose')

const unique = () =>{
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0')
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: 'Not Provided'
  },
  location: {
    type: String,
    default: 'Not Provided'
  },
  profilePicture: {
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
  },
  passwordHash: String,
  isAdmin: {
    type: Boolean,
    default: false,
  },
},
{ timestamps: true }
)


userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User