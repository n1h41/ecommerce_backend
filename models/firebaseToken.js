const mongoose = require('mongoose')
const User = require('./user')

const firebaseTokenSchema = new mongoose.Schema({
    firebase_device_token: {
        type: String,
        required: true,
        min: 4,
        max: 255,
        unique: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    }
})

module.exports = mongoose.model('FirebaseToken', firebaseTokenSchema)