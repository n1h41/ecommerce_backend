const { boolean } = require('@hapi/joi')
const mongoose = require('mongoose')
const User = require('./user')

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    inStock:{
        type: Boolean,
        default: true
    },
    offer_price: {
        type: Number,
        required: true,
        min: 1
    },
    image_url: [
        {
            type: String,
            required: true
        }
    ],
    image_file_name: [
        {
            type: String,
            required: true
        }
    ],
    category: {
        type: String
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    return_window: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Products', productSchema)