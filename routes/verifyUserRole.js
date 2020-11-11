const User = require("../models/user")


async function isVendor(req, res, next) {
    user = req.user
    if (user.role == 'vendor'){
        next()
    }
    else return res.status(400).send("Only vendors can access this page")
}

module.exports.isVendor = isVendor