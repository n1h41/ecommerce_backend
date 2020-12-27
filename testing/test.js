const router = require('express').Router()
const Products = require('../models/product')
const Category = require('../models/category')
const OrderDetails = require('../models/order_details')
const multer = require('multer')
const path = require('path')

/* const admin = require("firebase-admin");

const serviceAccount = require("../notifications-b1bc2-firebase-adminsdk-2y0c7-c118195f37.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
}); */

//adding category
router.get('/test', async (req, res) => {

    const category = new Category({
        category_name: req.query.q
    })

    try {

        const savedCategory = await category.save()
        res.send(savedCategory)

    }
    catch (err) {

        if (err.code == 11000) return res.status(400).send(`The category '${req.query.q}' already exists in Application. Please select it from dropdown menu.`)
        else return res.status(400).send(err)

    }

})

//adding product with category value taken from category document in the database
router.get('/test/2', async (req, res) => {

    try {

        category = await Category.findOne({ category_name: req.query.q })

        if (!category) return res.status(400).send(`The category ${req.query.q} doesn't exist. Please add the category.`)

    }
    catch (err) {

        return res.status(400).send(err)

    }

    try {

        const product = new Products({
            product_name: 'test product 2',
            price: 100,
            image_url: 'test url',
            image_file_name: 'test file name',
            pincode: 000000,
            category: category.category_name,
            vendor: 'test role'
        })

        return res.send(product)

    }
    catch (err) {

        return res.status(400).send(err)

    }
})

//deleting category
router.get('/test/3', async (req, res) => {

    /* res.send(req.query.q) */
    try {

        deletedCategory = await Category.findOneAndRemove({ category_name: req.query.q })

        if (!deletedCategory) return res.status(400).send(`The category '${req.query.q}' doesn't exist.`)

        res.send(deletedCategory)

    }
    catch (err) {

        res.status(400).send(err)

    }

})

const storage = multer.diskStorage({
    destination: './test/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({
    storage: storage
})

//image upload from flutter: testing
router.post('/test/img-upload', upload.array('images', 5), (req, res) => {

    console.log(req.files)

})

//inserting order date to database
router.post('/add/date', async (req, res) => {

    req.body.date = Date.now()

    const order = new OrderDetails(req.body)

    try {

        const savedOrder = await order.save()
        console.log(savedOrder)

    }
    catch (err) {

        res.status(400).send(err)

    }

})

//get order details for admin
router.get('/order/history', async (req, res) => {

    try {

        const orders = await OrderDetails.find()
        res.json(orders)

    } catch (err) {

        res.status(400).json({
            error: err
        })

    }

})

/* router.get('/messaging', async (req, res) => {

    var registrationToken = 'dizB6iLsTyuLGZms-axIHS:APA91bGx-vzoJ983HrCdHwiQbwrsPIUgstHbXDT83GVUawcd3W4yOUb5IGDI6EvivtBEyKH6ql3KaIsKKr5oDLEMyRWt7e625lljLSCoqMRma3R7ne8o7XIFXyVGl7zpH4qZP53pDt6a';

    var message = {
        notification: {
            title: 'From Server',
            body: 'Hello'
        },
        token: registrationToken
    }

    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });

}) */

module.exports = router