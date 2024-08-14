const jwt = require('jsonwebtoken')

const auth = (req,res,next)=>{
    const secret = process.env.SECRET
    const token = req.cookies['authcookie']
    jwt.verify(token,secret,(err,decoded)=>{
        if(err) return res.status(403).json({status : "Unauthorized"})
        req.user = decoded
        next()
    })
}

module.exports  = auth