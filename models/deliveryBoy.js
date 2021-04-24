const mongoose = require('mongoose')

const deliveryDataSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    message: {
        type: Object,
        required: true,
    },
    delivered: {
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = mongoose.model('DeliveryData', deliveryDataSchema)