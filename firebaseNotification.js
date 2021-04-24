const router = require('express').Router()
const admin = require("firebase-admin");
const serviceAccount = require("./notifications-b1bc2-firebase-adminsdk-2y0c7-c118195f37.json");
const FirebaseToken = require('./models/firebaseToken')
const User = require('./models/user')
const DeliveryData = require('./models/deliveryBoy')
const Notification = require('./models/notifications')
const authenticate = require('./routes/verifyToken');
const { not } = require('@hapi/joi');
const OrderDetails = require('./models/order_details');

// Initializing Firebase Admin to start sending messages
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Add Device Firebase token into database
router.post('/setToken', async (req, res) => {
  const firebaseToken = new FirebaseToken(req.body)
  try {
    const savedFirebaseToken = await firebaseToken.save()
    console.log(savedFirebaseToken)
    res.json({
      status: 'OK'
    })
  } catch (err) {
    return res.status(400).send(err)
  }
})

// Update Firebase Token document with user_id
router.patch('/setUserId', async (req, res) => {
  /* console.log(req.query.token) */
  /* console.log(req.body.token) */
  try {
    /* const firebaseDetailsDocument = await FirebaseToken.findOne({ firebase_device_token: req.body.token }) */
    const firebaseDetailsDocumentUpdated = await FirebaseToken.findOneAndUpdate({ firebase_device_token: req.body.token }, req.body, { useFindAndModify: false })
    console.log(firebaseDetailsDocumentUpdated)
    res.json({
      status: 'OK'
    })
  } catch (err) {
    console.log(err)
  }

})

// Send Notification to devices
router.post('/send', authenticate, async (req, res) => {
  var registrationTokens = []

  //sending notification to all users

  if (req.body.target == 'all') {
    try {
      const firebaseDocs = await FirebaseToken.find()
      for (var i = 0; i < firebaseDocs.length; i++) {
        registrationTokens.push(firebaseDocs[i]['firebase_device_token'])
      }
      var message = {
        notification: req.body.notification,
        tokens: registrationTokens
      }
      sendMessage(message)
    } catch (err) {
      return res.status(400).send(err)
    }

  } else if (req.body.target == 'vendors') {
    //sending notification to all vendors
    try {
      const vendorList = await User.find({ role: 'vendor' })
      for (var i = 0; i < vendorList.length; i++) {
        const token = await FirebaseToken.findOne({ user_id: vendorList[i]['_id'] })
        if (token) registrationTokens.push(token['firebase_device_token'])
      }
      var message = {
        notification: req.body.notification,
        tokens: registrationTokens
      }
      sendMessage(message)
    } catch (err) {
      return res.status(400).send(err)
    }

  } else {
    req.body.data.forEach(async element => {
      try {
        const token = await FirebaseToken.findOne({ user_id: element.vendor })
        if (token) {
          registrationTokens.push(token['firebase_device_token'])
          var message = {
            notification: {
              title: `${element.product_name} purchased by ${req.user.email}`,
              body: `Quantity: ${element.qty} X Price: ${element.price}`
            },
            data: {
              address: req.body.address,
              qty: element.qty,
              price: element.price
            },
            tokens: registrationTokens
          }
          sendMessage(message)
          const notif = new Notification({
            target: `${element.vendor}`,
            content: message
          })
          res.send(notif)
          const savedNotif = await notif.save()
          return res.json({ status: 'OK', notification: savedNotif })
        }
      } catch (err) {
        return res.status(400).send(err)
      }
    })
  }
})

router.post('/send/orderDetails/deliveryBoy', async (req, res) => {
  try {
    const updated_order = await OrderDetails.findByIdAndUpdate(req.query.id, req.body, { useFindAndModify: false })
    res.status(200).send(updated_order)
    const token = await FirebaseToken.findOne({ user_id: req.body.delivery_boy_id }, { firebase_device_token: 1, _id: 0 });
    if (token) {
      console.log(true)
      var message = {
        notification: {
          title: `New Delivery`,
          body: `ID: ${req.query.id}`
        },
        tokens: [token.firebase_device_token]
      }
      return sendMessage(message)
    }
  } catch (error) {
    console.log(error)
    return res.status(400).send(error)
  }
})

function sendMessage(message) {
  admin.messaging().sendMulticast(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      return response.responses[0].success
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}

async function sendNotifWebHook(orderId) {
  const orders = await OrderDetails.find({ order_id: orderId })
  orders.forEach(async (order) => {
    try {
      var registrationTokens = []
      const vendorId = await User.findOne({ email: order.vendor }, { _id: 1 })
      console.log(order)
      var message = {
        notification: {
          title: `${order.item} purchased by ${order.customer.name}`,
          body: `Price: ${order.amount.price * order.amount.qty}`,
        },
        data: {
          address: order.address,
          price: `${order.amount.price}`,
          qty: `${order.amount.qty}`
        }
      }
      const notif = new Notification({
        target: `${vendorId._id}`,
        content: message,
        order_id: order._id //individual order id, not the one generated for razorpay
      })
      const savedNotif = await notif.save()
      console.log(savedNotif)
      const token = await FirebaseToken.findOne({ user_id: vendorId })
      if (token) {
        registrationTokens.push(token['firebase_device_token'])
        message = {
          ...message,
          tokens: registrationTokens
        }
        sendMessage(message)
      }
    } catch (error) {
      return console.log(error)
    }
  })
}

module.exports = router
module.exports.sendNotifWebHook = sendNotifWebHook
