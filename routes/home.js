const router = require('express').Router()
const Products = require('../models/product')
const Notification = require('../models/notifications')
const authenticate = require('./verifyToken')
router.get('', authenticate, async (req, res) => {
    try{
        if(req.query.category == 'default'){
            const productList = await Products.find({pincode: req.query.pincode})
            return res.send(productList)
        }
        else {
            const productList = await Products.find({pincode: req.query.pincode, category: req.query.category})
            return res.send(productList)
        }  
    }
    catch(err){
        res.send(err)
    }

})

// Product Search Funtionality
router.get('/items', async (req, res) => {

    try{
        searchResult = await Products.find({ product_name : new RegExp(req.query.search, "i"), pincode: req.query.pincode})
        if( searchResult.length == 0 ) return res.status(400).send("No product's found")
        else return res.send(searchResult)

    }
    catch(err){
        res.status(400).send(err)
    }

})

// Get Notification List
router.get('/notification/list', authenticate, async (req, res) => {

    const notifList = await Notification.find({target: req.user._id})
    res.send(notifList)

})

module.exports = router