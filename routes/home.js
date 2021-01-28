const router = require('express').Router()
const Products = require('../models/product')
const Notification = require('../models/notifications')
const FirebaseToken = require('../models/firebaseToken')
const User = require('../models/user')
const DeliveryData = require('../models/deliveryBoy')
const authenticate = require('./verifyToken')
const firebaseToken = require('../models/firebaseToken')
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

//Logout
router.post('/logout', authenticate, async (req, res) => {
    try {
        const doc = await firebaseToken.findOneAndDelete({user_id: req.user._id}, { useFindAndModify: false })
        console.log(`${req.user.name} logged Out\n`,doc)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Get delivery details for delivery Boy
router.get('/deliveryDetails', authenticate, async (req, res) => {
    try {
        const data = await DeliveryData.find({user_id: req.user._id})
        res.send(data)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Update Delivery status
router.post('/deliveryDetails/update', authenticate, async (req, res) => {
    /* console.log(req) */
    try {
        const data = await DeliveryData.findByIdAndUpdate(req.body.id, req.body.update)
        console.log(data)
        return res.status(200).json({status:'OK'})
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = router