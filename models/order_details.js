const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    customer: {
        type: Object,
        required: true,
    },
    vendor: {
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
        type: Object,
        required: true,
    },
    payment_status: {
        default: 'PENDING',
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    item: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    order_id: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    date: {
        type: Date,
        required: true
    },
    delivered: {
        type: Boolean,
        default: false
    },
    delivery_boy_id: {
        type: String
    },
    return: {
        type: Object
    },
    return_window: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('OrderDetails', orderSchema)