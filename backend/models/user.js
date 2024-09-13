const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {       
    type: String,
    required: true,
    unique: true // this ensures the uniqueness of username  
    },
  email: {       
    type: String,
    required: true,
    unique: true // this ensures the uniqueness of username  
    },
    profilePicture: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
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
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User