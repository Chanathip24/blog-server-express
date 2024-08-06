const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const session = require('express-session')
const cookieparser = require('cookie-parser')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const {validationResult} = require('express-validator')
//db
const sql = require('./services/server')

const saltRounds = 10;
//using express
const app = express()
const PORT = 8000;

//secret
const secret = process.env.SECRET //can change or using env
//middleware
app.use(cookieparser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin : ['http://localhost:5173'],
    credentials: true
}))

//validation
const {registerValidator,loginValidator} = require('./services/validation')

//router test
app.get('/',(req,res)=>{
    res.send("<h1>test</h1>")
})
// check auth
app.get('/api/checkauth',(req,res)=>{
    const token = req.cookies['authcookie']
    if(!token) { 
        return res.json({status: "No token"})
    }

    jwt.verify(token,secret,(error,decoded)=>{
        if(error) return res.status(403).json({message:"Token invalid"})
        return res.status(200).json({status:"pass", user: decoded})
    })
    
})
//api 
app.post('/api/register',registerValidator,(req,res)=>{
    //validation result
    const error = validationResult(req)
    if(!error.isEmpty()){
        return res.json({message:"Validation Error"})
    }
    //query
    const query = "INSERT INTO Users(username,email,fname,lname,password) Values(?,?,?,?,?)"
    //req data from body
    const data = [req.body.username,
        req.body.email,
        req.body.fname,
        req.body.lname
    ]
    //start hash
    bcrypt.hash(req.body.password,saltRounds,(error,hash)=>{
        if(error) res.status(400).json({message:"hash failed"}) 
        //start query
        sql.query(query,[...data,hash],(err)=>{
            if(err) {
                return res.status(400).json({message : "Error register"})
            ;}
            const {username,email,fname} = req.body;
            const token = jwt.sign({username,email,fname},secret)
            res.cookie('authcookie',token,{httpOnly:true,maxAge:900000})
            res.status(200).json({status:"success"})
        })
    })
    
})
// login
app.post('/api/login',loginValidator,(req,res)=>{
    const query = "SELECT * FROM Users where username = ?"

    //validation result and check validation
    const vali = validationResult(req)
    if(!vali.isEmpty()) return res.json({message:"Validation Error"})
    
    const username = req.body.username
    const password = req.body.password

    
    sql.query(query,[username],(err,result)=>{
        if(err) return res.status(401).json({message:"Error query"})
        if(result.length > 0){
            const user = result[0]
            bcrypt.compare(password,user.password,(err,result)=>{
                if(err) return res.status(401).json({message:"Error comparing"})
                if(result) {
                    const {username,email,fname} = user
                    const token = jwt.sign({username,email,fname},secret)
                    res.cookie('authcookie',token,{httpOnly:true,maxAge:900000})
                    return res.status(200).json({status:"pass"})
                }
                return res.status(401).json({status:"wrong password"})
            })
        }
        return res.status(401).json({status:"No User"})
        
    })
})
app.listen(PORT,(err)=>{
    if(err) throw err;
    console.log(`Server is running on PORT ${PORT}`)
})

