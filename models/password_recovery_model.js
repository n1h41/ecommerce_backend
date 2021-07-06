const mongoose = require('mongoose')
const User = require('./user')

const passRecoveryModelSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 255
    }
})

module.exports = mongoose.model('PassRecoveryModel', passRecoveryModelSchema)