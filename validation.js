//VALIDATION//
const joi = require('@hapi/joi')

const userValidation = (data) => {
    const schema = joi.object({
        name: joi.string().min(3).required(),
        email: joi.string().min(6).required().email(),
        password: joi.string().min(6).required(),
        role: joi.string().min(3).required(),
        pincode: joi.number().required().integer().min(6)
    })
    return schema.validate(data)
}

const productdetailsValidation = (data) => {
    const schema = joi.object({
        product_name: joi.string().min(3).required(),
        price: joi.number().required().integer().min(1),
        pincode: joi.number().required().integer().min(6),
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
module.exports.productdetailsValidation = productdetailsValidation