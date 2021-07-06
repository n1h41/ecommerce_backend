const router = require('express').Router()
const authenticate = require('./verifyToken')
const { isAdmin } = require('./verifyUserRole')
const User = require('../models/user')
const AboutUs = require('../models/about_us')
const OrderDetails = require('../models/order_details')
const Category = require('../models/category')
const Products = require('../models/product')
const BannerDetails = require('../models/banner_details')
const { userValidation } = require('../validation')
const { deliveryBoyValidation } = require('../validation')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

//storage setup for uploading images
const storage = multer.diskStorage({
    destination: './uploads/banners',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({
    storage: storage
})

router.get('/vendor/list', authenticate, isAdmin, async (req, res) => {

    try {
        //get list of vendors
        const vendorList = await User.find({ role: 'vendor' })
        if (vendorList == null) return res.status(400).send("No vendors registered")
        return res.send(vendorList)

    }
    catch (err) {
        res.status(400).send(err)
    }
})

router.post('/vendor/add', authenticate, isAdmin, async (req, res) => {

    //To remove null key:value from the json
    const removeEmptyOrNull = (obj) => {
        Object.keys(obj).forEach(k =>
            (obj[k] && typeof obj[k] === 'object') && removeEmptyOrNull(obj[k]) ||
            (!obj[k] && obj[k] !== undefined) && delete obj[k]
        );
        return obj;
    };
    req.body = removeEmptyOrNull(req.body)

    //vendor details validation
    const { error } = userValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    //checking if the vendor already exists
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Vendor with this email already exist')

    //hashing the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    //create user document and save
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: 'vendor',
        pincode: req.body.pincode,
        mobileNumber: req.body.mobileNumber
    })
    const savedUser = await user.save()
    res.send(savedUser)
})

router.delete('/vendor/delete/:email', authenticate, isAdmin, async (req, res) => {

    try {

        const deleteVendor = await User.findOneAndDelete({ email: req.params.email })
        if (deleteVendor == null) return res.status(400).send("Vendor doesn't exist.")
        res.send(deleteVendor)

    }
    catch (err) {

        res.status(400).send(err)

    }

})

router.patch('/vendor/update/:email', authenticate, isAdmin, async (req, res) => {

    //To remove null key:value from the json
    const removeEmptyOrNull = (obj) => {
        Object.keys(obj).forEach(k =>
            (obj[k] && typeof obj[k] === 'object') && removeEmptyOrNull(obj[k]) ||
            (!obj[k] && obj[k] !== undefined) && delete obj[k]
        );
        return obj;
    };
    req.body = removeEmptyOrNull(req.body)

    if (req.body.hasOwnProperty('password')) {

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        req.body.password = hashedPassword

    }
    try {

        const updatedVendor = await User.findOneAndUpdate({ email: req.params.email }, req.body, { useFindAndModify: false })
        if (updatedVendor == null) return res.status(400).send("Vendor doesn't exist")
        return res.send(updatedVendor)

    }
    catch (err) {

        res.status(400).send(err)

    }
    return res.send(req.body)

})

//get all order history
router.get('/order/history', authenticate, isAdmin, async (req, res) => {
    try {
        const orders = await OrderDetails.find()
        /* console.log(orders) */
        res.json(orders)
    } catch (err) {
        res.status(400).json({
            error: err
        })
    }
})

//add delivery boy
router.post('/delivery-boys/add', async (req, res) => {
    const { error } = deliveryBoyValidation(req.body)
    if (error) return res.status(400).json(error)
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    req.body.password = hashedPassword
    const user = new User(req.body)
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Delivery boy with this email already exist')
    try {
        const savedData = await user.save()
        console.log(savedData)
        return res.status(200).send(savedData)
    } catch (err) {
        return res.status(400).json(err)
    }
})

//About us
router.post('/about-us/add', async (req, res) => {
    try {
        const update = await AboutUs.findByIdAndUpdate({ _id: '6038d1026056deb5fc3bc7c8' }, req.body, { useFindAndModify: false })
        console.log(update)
        return res.json({
            status: 'OK'
        })
    } catch (err) {
        return res.status(400).send(err)
    }
})

//Get all user details
router.get('/user-details', async (req, res) => {
    try {
        const users = await User.find({ role: { $not: { $regex: 'admin' } } }, { _id: 0, __v: 0 })
        return res.send(users)
    } catch (error) {
        return res.status(400).send(error)
    }
})

router.get('/user-details/search', async (req, res) => {
    /* console.log(req.query.q) */
    try {
        const users = await User.find({ name: new RegExp(req.query.q, "i") }, { _id: 0, __v: 0 })
        return res.send(users)
    } catch (error) {
        return res.status(400).send(error)
    }
})

router.delete('/categories/delete', authenticate, isAdmin, async (req, res) => {
    try {
        const deletedData = await Category.findByIdAndDelete(req.query.q)
        if (deletedData === null) {
            return res.status(400).json({
                error: "Category doesn't exist."
            })
        }
        return res.send(deletedData)
    } catch (error) {
        console.log(error)
        return res.send(error)
    }
})

router.get('/trade-details', /* authenticate, isAdmin, */ async (req, res) => {
    try {
        var finalData = []
        var result = [], a = [];
        months = {
            1: 'january',
            2: 'february',
            3: 'march',
            4: 'april',
            5: 'may',
            6: 'june',
            7: 'july',
            8: 'august',
            9: 'september',
            10: 'october',
            11: 'november',
            12: 'december',
        }
        const data = await OrderDetails.find({ vendor: req.query.q, payment_status: 'SUCCESS' }, { _id: 0, amount: 1, date: 1 })
        data.map((item) => {
            var mmyy = `${months[item.date.getMonth() + 1]}-${item.date.getFullYear()}`
            var amount = item.amount.price * item.amount.qty
            finalData.push({
                mmyy: mmyy,
                amount: amount
            })
            a.push(mmyy)
        })
        a = [...new Set(a)] // removing duplicate
        for (let i = 0; i < a.length; i++) {
            var sum = 0
            for (let j = 0; j < finalData.length; j++) {
                if (a[i] == finalData[j].mmyy) {
                    sum = sum + finalData[j].amount
                }
            }
            result.push({
                month: a[i],
                amount: sum
            })
        }
        console.log(finalData)
        return res.send(result)
    } catch (error) {
        console.log(error)
        return res.send(error)
    }
})

router.post('/banner/add', upload.single('banner-image'), async (req, res) => {
    req.body.url = `127.0.0.1:3000/banner-images/${req.file.filename}`
    const banner = new BannerDetails(req.body)
    try {
        const savedData = await banner.save()
        return res.send(savedData)
    } catch (error) {
        console.log(error)
        return res.send(error)
    }

})

router.delete('/banner/delete', (req, res) => {
    BannerDetails.findOneAndDelete({_id: req.query.q},{_id: 0, url: 1}).then(response => {
        if(!response) return res.status(404).send('No such file')
        const filename = response.url.split('banner-images/')[1]
        const path = `uploads/banners/${filename}`
        fs.unlink(path, (err) => {
            if(err) {
                console.log(err)
                return res.status(404).send('No such file')
            }
            return res.send('Image Deleted')
        })
    }).catch(err => console.log(err))
})

module.exports = router