//VALIDATION//
const joi = require('@hapi/joi')

const userValidation = (data) => {
    const schema = joi.object({
        name: joi.string().min(3).required(),
        email: joi.string().min(6).required().email(),
        password: joi.string().min(6).required(),
        role: joi.string().min(3).required(),
        pincode: joi.required(),
        mobileNumber: joi.number().integer().min(10).required(),
        availability: joi.boolean(),
        onDelivery: joi.boolean()
    })
    return schema.validate(data)
}

const deliveryBoyValidation = (data) => {
    const schema = joi.object({
        name: joi.string().min(3).required(),
        email: joi.string().min(6).required().email(),
        password: joi.string().min(6).required(),
        role: joi.string().min(3).required(),
        pincode: joi.required(),
        mobileNumber: joi.number().integer().min(10),
        availability: joi.boolean().required(),
        onDelivery: joi.boolean().required()
    })
    return schema.validate(data)
}

const productDetailsValidation = (data) => {
    const schema = joi.object({
        product_name: joi.string().min(1).required(),
        price: joi.number().required().integer().min(1),
        offer_price: joi.number().required().integer().min(1),
        category: joi.string().min(3).required()
    })
    return schema.validate(data)
}

const loginValidation = (data) => {
    const schema = joi.object({
        email: joi.string().min(6).required().email(),
        password: joi.string().min(6).required(),
    })
    return schema.validate(data)
}

module.exports.userValidation = userValidation
module.exports.loginValidation = loginValidation
module.exports.productDetailsValidation = productDetailsValidation
module.exports.deliveryBoyValidation = deliveryBoyValidation