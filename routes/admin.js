const router = require('express').Router()
const authenticate = require('./verifyToken')
const { isAdmin } = require('./verifyUserRole')
const User = require('../models/user')
const AboutUs = require('../models/about_us')
const OrderDetails = require('../models/order_details')
const { userValidation } = require('../validation')
const { deliveryBoyValidation } = require('../validation')
const bcrypt = require('bcryptjs')

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
        
    } catch (err) {
        return res.status(400).json(err)
    }

})

//About us
router.post('/about-us/add', async (req, res) => {
    /* console.log(req.body) */
    /* const details = new AboutUs(req.body) */
    try {
        const update = await AboutUs.findByIdAndUpdate({_id:'6038d1026056deb5fc3bc7c8'}, req.body, {useFindAndModify: false})
        console.log(update)
        return res.json({
            status: 'OK'
        })
    } catch (err) {
        return res.status(400).send(err)
    }
})

module.exports = router