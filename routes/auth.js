const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const { registerValidation, loginValidation } = require('../validation')

//user register
router.post('/register', async (req, res) => {
    // validate data before submitting
    const { error } = registerValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    //checking if user is already in database
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Email Already Exists')

    //hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    //create a user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
        pincode: req.body.pincode,
    })
    try {
        const savedUser = await user.save()
        res.send(savedUser)
    }
    catch (err) {
        res.status(400).send(err)
    }
})

//user login
router.post('/login', async (req, res) => {
    //validation
    const { error } = loginValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    //check if user is registered or not
    const user = await User.findOne({email: req.body.email})
    if(!user) return res.status(400).send("Email not found")

    //check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if(!validPass) return res.status(400).send("Incorrect Password")

    //create and assign a jwt token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
    console.log("Logged In")
    return res.header('auth-token', token).send(user)
})

module.exports = router