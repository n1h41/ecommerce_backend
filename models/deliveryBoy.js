const mongoose = require('mongoose')

const deliveryBoySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    mobileNumber: {
        type: Number,
        required: true,
        min: 10
    },
    pincode: {
        type: Number,
        required: true,
        min: 6,
    },
    address: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    availablitiy: {
        type: Boolean,
        required: true,
        default: true,
    },
    isOnDelivery: {
        type: Boolean,
        required: true,
        default: false,
    }
})

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema)