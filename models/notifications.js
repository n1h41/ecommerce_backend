const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({

    target: {
        type: String,
        required: true,
        min: 3,
        max: 5,
    },
    content: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    image_url: {
        type: String,
        min: 4,
        max: 255
    },
    target_group: [
        {
            type: String,
            required: true,
            min: 3,
            max: 10
        }
    ]

})

module.exports = mongoose.model('Notification', notificationSchema)