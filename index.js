const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const session = require('express-session')
const cookieparser = require('cookie-parser')
//db
const sql = require('./services/server')

//using express
const app = express()
const PORT = 8000;

//middleware
app.use(cookieparser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

//router
app.get('/',(req,res)=>{
    res.send("<h1>test</h1>")
})

app.listen(PORT,(err)=>{
    if(err) throw err;
    console.log(`Server is running on PORT ${PORT}`)
})

