const mongoose = require('mongoose')

const date = new Date()

const orderSchema = new mongoose.Schema({
    customer: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    vendor_list: [
        {
            type: String,
            required: true,
            min: 6,
            max: 255
        }
    ],
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
        default: 'PENDING',
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    items: [
        {
            type: String,
            required: true,
            min: 4,
            max: 255
        }
    ],
    order_id: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    date: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('OrderDetails', orderSchema)