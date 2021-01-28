const router = require('express').Router()
const admin = require("firebase-admin");
const serviceAccount = require("./notifications-b1bc2-firebase-adminsdk-2y0c7-c118195f37.json");
const FirebaseToken = require('./models/firebaseToken')
const User = require('./models/user')
const DeliveryData = require('./models/deliveryBoy')
const Notification = require('./models/notifications')
const authenticate = require('./routes/verifyToken')

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
router.post('/send'/* , authenticate */, async (req, res) => {
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
  /* console.log(req.body) */
  try {
    const user = await User.findOne({ mobileNumber: req.query.q }, { name: 1 })
    const token = await FirebaseToken.findOne({ user_id: user._id }, { firebase_device_token: 1, _id: 0 });
    var message = {
      notification: {
        title: `New Delivery`,
        body: `${req.body.content.notification.title}`
      },
      data: {
        address: `${req.body.content.data.address}`,
        qty: `${req.body.content.data.qty}`,
        price: `${req.body.content.data.price}`
      },
      tokens: [token.firebase_device_token]
    }
    sendMessage(message)
    /* if (isSuccess == true) { */
      try {
        /* const deleteData = await Notification.findByIdAndDelete(req.body._id) */
        const delivery_data = new DeliveryData({
          user_id: user._id,
          message: {
            title: message.notification.body,
            address: message.data.address,
            qty: message.data.qty,
            price: message.data.price
          }
        })
        try {
          const savedData = await delivery_data.save()
          return res.json({ status: 'OK' })
        } catch (err) {
          return res.status(400).send(err)
        }
      } catch (err) {
        res.status(400).send(400)
      }
    /* } */
  } catch (err) {
    return res.status(400).json(err)
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

module.exports = router
/* module.exports.sendNotificationToVendor = sendNotificationToVendor */