const mongoose = require('mongoose')
const User = require('./user')

const orderSchema = new mongooseSchema({
    user: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    address: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    payment_status: {
        type: String,
        required: true,
        min: 4,
        max: 255
    }
})

module.exports = mongoose.model('OrderDetails', orderSchema)