const router = require('express').Router()
const admin = require("firebase-admin");
const serviceAccount = require("./notifications-b1bc2-firebase-adminsdk-2y0c7-c118195f37.json");
const FirebaseToken = require('./models/firebaseToken')
const User = require('./models/user')
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

    res.status(400).send(err)

  }

})

// Update Firebase Token document with user_id
router.patch('/setUserId', async (req, res) => {

  /* console.log(req.query.token) */

  try {
    const firebaseDetailsDocument = await FirebaseToken.findOne({ firebase_device_token: 'dizB6iLsTyuLGZms-axIHS:APA91bGx-vzoJ983HrCdHwiQbwrsPIUgstHbXDT83GVUawcd3W4yOUb5IGDI6EvivtBEyKH6ql3KaIsKKr5oDLEMyRWt7e625lljLSCoqMRma3R7ne8o7XIFXyVGl7zpH4qZP53pDt6a' })
    const firebaseDetailsDocumentUpdated = await FirebaseToken.findByIdAndUpdate({ _id: firebaseDetailsDocument._id }, req.body, { useFindAndModify: false })
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
  try {
    //sending notification to all users
    if (req.body.target == 'all') {
      const firebaseDocs = await FirebaseToken.find()
      for (var i = 0; i < firebaseDocs.length; i++) {
        registrationTokens.push(firebaseDocs[i]['firebase_device_token'])
      }
    } else if (req.body.target == 'vendors') {
      //sending notification to all vendors
      const vendorList = await User.find({ role: 'vendor' })
      for (var i = 0; i < vendorList.length; i++) {
        const token = await FirebaseToken.findOne({ user_id: vendorList[i]['_id'] })
        if (token) registrationTokens.push(token['firebase_device_token'])
      }
    } else {
      req.body.data.forEach(async element => {
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
          /* admin.messaging().sendMulticast(message)
            .then((response) => {
              console.log('Successfully sent message:', response);
            })
            .catch((error) => {
              console.log('Error sending message:', error);
            }); */



          const notif = new Notification({
            target: `${element.vendor}`,
            content: message
          })

          try {

            const savedNotif = await notif.save()
            return res.json({ status: 'OK', notification: savedNotif })

          } catch (err) {

            return res.status(400).json(err)

          }
        }
      })
    }

    var message = {
      notification: req.body.notification,
      tokens: registrationTokens
    }

    admin.messaging().sendMulticast(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });

    return res.json({
      'Notification status': 'OK'
    })

  } catch (err) {
    return console.log(err)
  }
})

/* function sendNotificationToVendor() {



} */

module.exports = router
/* module.exports.sendNotificationToVendor = sendNotificationToVendor */