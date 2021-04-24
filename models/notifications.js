const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({

    target: {
        type: String,
        required: true,
        min: 3,
        max: 5,
    },
    order_id: {
        type: String,
        required: true
    },
    content: {
        type: Object,
        required: true,
    },
    image_url: {
        type: String,
        min: 4,
        max: 255
    }

})

module.exports = mongoose.model('Notification', notificationSchema)