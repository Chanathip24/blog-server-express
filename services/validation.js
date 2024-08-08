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

const insertValidator = [
    body('author').trim().isLength({min:1}).escape(),
    body('title').trim().isLength({min:1}).escape(),
    body('description').isLength({min:1}).trim().escape(),
    body('urlToImage').isLength({min:1}).isURL(),
    body('publishedAt').trim().escape(),
    body('catagory').trim().escape(),
    body('content').isLength({min:1}).trim().escape()
]



module.exports = {registerValidator,loginValidator,insertValidator}