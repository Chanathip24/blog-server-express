const {body} = require('express-validator')

//register validator
const registerValidator = [
    body('username').trim().isLength({min : 1}).escape(),
    body('email').isEmail().normalizeEmail().escape(),
    body('fname').trim().isLength({min:1}).escape(),
    body('lname').trim().isLength({min:1}).escape(),
    body('password').trim().isLength({min: 6}).escape()
]

const loginValidator = [
    body('username').trim().isLength({min:1}).escape(),
    body('password').trim().isLength({min:6}).escape()
]

module.exports = {registerValidator,loginValidator}