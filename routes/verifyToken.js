const jwt = require('jsonwebtoken')
const User = require('../models/user')

async function auth (req, res, next) {
    const token = req.header('auth-token')
    if(!token) return res.status(401).send('Access Denied')

    try{
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        userID = verified._id
        req.user = await User.findById(userID)
        next()
    }
    catch(err){
        res.status(400).send('Invalid Token')
    }
}

module.exports = auth