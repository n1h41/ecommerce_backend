const router = require('express').Router()
const { json } = require('express')
const User = require('../models/user')
const Products = require('../models/product')
const authenticate = require('./verifyToken')

router.get('/home/:userPincode', authenticate, async (req, res) => {
    try{
        const productList = await Products.find({pincode: req.params.userPincode})
        res.send(productList)
    }
    catch(err){
        res.send(err)
    }
})

module.exports = router