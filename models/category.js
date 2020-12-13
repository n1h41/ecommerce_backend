const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        min: 3,
        max: 255,
        unique: true
    }
})

module.exports = mongoose.model('Category', categorySchema)