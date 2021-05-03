const router = require('express').Router()
const Razorpay = require('razorpay')
const shortid = require('shortid')
const crypto = require('crypto')
const authenticate = require('./verifyToken')
const OrderDetails = require('../models/order_details')
const User = require('../models/user')
const { sendNotifWebHook } = require('../firebaseNotification.js')

const razorpay = new Razorpay({
    key_id: 'rzp_test_D0F6z1KC78AFis',
    key_secret: 'ksEttQBr8ykpdjpnSIUaG794'
})

//generate order ID
router.post('/payment', authenticate, async (req, res) => {
    const payment_capture = 1
    const amount = req.body.amount * 100
    const currency = req.body.currency
    const options = {
        amount,
        currency,
        receipt: shortid.generate(),
        payment_capture,
        notes: {
            user: req.user.name,
            user_email: req.user.email,
        }
    }
    try {
        const response = await razorpay.orders.create(options)
        return res.json({
            amount: response.amount,
            currency: response.currency,
            id: response.id,
        })
    } catch (err) {
        return res.status(400).send(err)
    }
})

// add order details to database
router.post('/order/add', authenticate, async (req, res) => {
    const vendorMail = await User.findById(req.body.vendor_id, { _id: 0, email: 1})
    const order = new OrderDetails({
        customer: {
            name: req.user.name,
            id: req.user._id,
            mobileNumber: req.user.mobileNumber,
        },
        vendor: vendorMail.email,
        address: req.body.address,
        amount: req.body.amount,
        item: req.body.product,
        order_id: req.body.order_id,
        date: Date.now(),
        return_window: req.body.return_window
    })
    try {
        const savedOrder = await order.save()
        console.log(savedOrder)
        return res.sendStatus(200)
    } catch (err) {
        console.log(err)
        return res.sendStatus(400)
    }
})

//Razorpay webhook
router.post('/verification', async (req, res) => {
    const secret = 'n2ks9x64'
    const payment_status = req.body['payload']['payment']['entity']['status']
    const order_id = req.body['payload']['payment']['entity']['order_id']
    const shasum = crypto.createHmac('sha256', secret)
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest('hex')
    if (digest === req.headers['x-razorpay-signature']) {
        console.log('request is legit')
        if (payment_status === 'captured') {
            const update = {
                'payment_status': 'SUCCESS'
            }
            try {
                /* sendNotificationToVendor() */

                sendNotifWebHook(req.body.payload.payment.entity.order_id)

                const updatedOrder = await OrderDetails.updateMany({ order_id: order_id }, update)
                /* console.log(updatedOrder) */
                return res.sendStatus(200)
            } catch (err) {
                console.log(err)
                return res.status(400)
            }
        } else if (payment_status === 'failed') {
            const update = {
                'payment_status': 'FAILED'
            }
            try {
                const updatedOrder = await OrderDetails.updateMany({ order_id: order_id }, update)
                console.log(updatedOrder)
                return res.sendStatus(200)
            } catch (err) {
                return res.status(400).send(err)
            }
        }
    } else {
        console.log('request is not legit')
        res.status(400).send('Poda panni')
    }
    res.json({
        status: 'ok'
    })
})

// update order status. If decided to use again, paste the code before the code where file is exported.
router.patch('/order/update', authenticate, async (req, res) => {
    const update = {
        'payment_status': req.body.order_status
    }
    try {
        const updatedOrder = await OrderDetails.updateMany({ order_id: req.body.order_id }, update, { useFindAndModify: false })
        console.log(updatedOrder)
        return res.sendStatus(200)
    } catch (err) {
        return res.status(400).send(err)
    }
})

module.exports = router
/* async function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
} */