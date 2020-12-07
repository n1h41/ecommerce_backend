const router = require('express').Router()
const { json } = require('express')
const User = require('../models/user')
const Products = require('../models/product')
const authenticate = require('./verifyToken')

router.get('/home/:userPincode/:category', authenticate, async (req, res) => {
    try{
        if(req.params.category == 'default'){
            const productList = await Products.find({pincode: req.params.userPincode})
            return res.send(productList)
        }
        else {
            const productList = await Products.find({pincode: req.params.userPincode, category: req.params.category})/* .find({pincode: req.params.userPincode}) */
            return res.send(productList)
        }  
    }
    catch(err){
        res.send(err)
    }
})

module.exports = router