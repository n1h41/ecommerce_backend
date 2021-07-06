const router = require('express').Router()
const Products = require('../models/product')
const Notification = require('../models/notifications')
const AboutUs = require('../models/about_us')
const DeliveryData = require('../models/deliveryBoy')
const BannerDetails = require('../models/banner_details')
const OrderDetails = require('../models/order_details')
const authenticate = require('./verifyToken')
const firebaseToken = require('../models/firebaseToken')
const User = require('../models/user')

router.get('', authenticate, async (req, res) => {
    try {
        /* var vendors = await User.find({ pincode: req.query.pincode, role: 'vendor' }, { _id: 1 })
        var vendors = [...vendors,'6092938f4a9a3a6970812f79'] //added a master vendor id */
        if (req.query.category == 'default') {
            const products = await Products.find(/* { vendor: { $in: vendors } } */)
            return res.send(products).status(200)
        } else {
            const products = await Products.find({ /* vendor: { $in: vendors },  */category: req.query.category })
            return res.send(products).status(200)
        }
    } catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }
})

// Product Search Funtionality
router.get('/items', async (req, res) => {
    try {
        const vendors = await User.find({ pincode: req.query.pincode, role: 'vendor' }, { _id: 1 })
        searchResult = await Products.find({ product_name: new RegExp(req.query.search, "i"), vendor: { $in: vendors } })
        if (searchResult.length == 0) return res.status(400).send("No product's found")
        else return res.send(searchResult)
    }
    catch (err) {
        res.status(400).send(err)
    }
})

// Get Notification List
router.get('/notification/list', authenticate, async (req, res) => {
    const notifList = await Notification.find({ target: req.user._id })
    res.send(notifList)
})

//Logout
router.post('/logout', authenticate, async (req, res) => {
    try {
        const doc = await firebaseToken.findOneAndDelete({ user_id: req.user._id }, { useFindAndModify: false })
        console.log(`${req.user.name} logged Out\n`, doc)
    } catch (err) {
        res.status(400).send(err)
    }
})

//Get delivery details for delivery Boy
router.get('/deliveryDetails', authenticate, async (req, res) => {
    try {
        const data = await OrderDetails.find({ delivery_boy_id: req.user._id })
        return res.send(data)
    } catch (err) {
        console.log(err)
        return res.status(400).send(err)
    }
})

//Update Delivery status
router.post('/deliveryDetails/update', authenticate, async (req, res) => {
    try {
        const updateData = await OrderDetails.findByIdAndUpdate(req.query.id, req.body)
        console.log(updateData)
        return res.status(200).json({ status: 'OK' })
    } catch (err) {
        console.log(err)
        return res.status(400).send(err)
    }
})

//Get About Us details
router.get('/about-us', async (req, res) => {
    const details = await AboutUs.findById({ _id: '6038d1026056deb5fc3bc7c8' }, { _id: 0 })
    res.send(details)
})

//Get previous order history
router.get('/previous-orders', authenticate, async (req, res) => {
    try {
        const order_history = await OrderDetails.find({"customer.id": req.user._id })
        return res.send(order_history).status(200)
    } catch (error) {
        console.log(error)
        res.send(error).status(400)
    }
})

//Return product
router.get('/return-product', authenticate, async (req, res) => {
    try {
        const update = {
            return: {
                initiated: true,
                completed: false,
            }
        }
        const updatedOrder = await OrderDetails.findByIdAndUpdate(req.query.id, update, {useFindAndModify: false})
        console.log(updatedOrder)
        return res.send(updatedOrder).status(200)
    } catch (error) {
        console.log(error)
        res.send(error).status(400)
    }
})

router.post('/order-details/update', authenticate, async (req, res) => {
    console.log(req.query.id, req.body)
    try {
        const updateData = await OrderDetails.findByIdAndUpdate(req.query.id, req.body)
        console.log(updateData)
        return res.status(200).json({ status: 'OK' })
    } catch (err) {
        console.log(err)
        return res.status(400).send(err)
    }
})

router.get('/banner', (req, res) => {
    BannerDetails.find({},{url: 1}).then((response) => {
        if(response.length != 0) return res.send(response)
        else return res.status(400).send('No banners available')
    })
})

module.exports = router