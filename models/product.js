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
    pincode: {
        type: Number,
        required: true,
        min: 5
    },
    category: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    }
})

module.exports = mongoose.model('Products', productSchema)