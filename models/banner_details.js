const mongoose = require('mongoose')

const bannerDetailSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    url: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('BannerDetails', bannerDetailSchema)