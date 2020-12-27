const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    role: {
        type: String,
        required: true,
        min: 3,
        max: 8,
    },
    pincode: {
        type: Number,
        required: true,
        min: 6,
    }
})

module.exports = mongoose.model('User', userSchema)