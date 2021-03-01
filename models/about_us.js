const mongoose = require('mongoose')

const aboutUsSchema = new mongoose.Schema({
    email: {
        type: String,
        min: 4,
        max: 255
    },
    mobileNumber: {
        type: Number,
        min: 10,
    },
    address: {
        type: String,
        min: 10,
        required: true,
        max: 255
    }
})

module.exports = mongoose.model('AboutUs', aboutUsSchema)