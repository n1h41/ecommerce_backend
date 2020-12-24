const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = express()
const authRoute = require('./routes/auth')
const homeRoute = require('./routes/home')
const vendorRoute = require('./routes/vendor')
const adminRoute = require('./routes/admin')
const testRoute = require('./testing/test')
const razorpay = require('./routes/razorpay')
const firebaseNotification = require('./firebaseNotification')

dotenv.config()

async function ConnectDB() {
    try {
        await mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log('DB Connected Successfully')
    }
    catch (err) {
        console.log(err)
    }
}

ConnectDB()

app.use(express.json({ extended: false}))

//to access static files
app.use('/images', express.static('./uploads/images'))

app.use('/api', authRoute)
app.use('/api', homeRoute)
app.use('/api/vendor', vendorRoute)
app.use('/api/admin', adminRoute)
app.use('/api/razorpay', razorpay)
app.use('/api/firebase', firebaseNotification)

app.use('', testRoute)

app.listen(3000, () => {
    console.log('Server running at http://127.0.0.1:3000')
})