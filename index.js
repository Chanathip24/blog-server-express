const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cookieparser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require("express-validator");
//db
const sql = require("./services/server");
//validation
const {
  registerValidator,
  loginValidator,
  insertValidator,
} = require("./services/validation");

const auth = require('./services/auth')

const saltRounds = 10;
//using express
const app = express();
const PORT = process.env.PORT;

//secret
const secret = process.env.SECRET; //can change or using env
//middleware

app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.URL],
    credentials: true,
  })
);



// check auth
app.get("/api/checkauth", (req, res) => {
  const token = req.cookies["authcookie"];
  if (!token) {
    return res.json({ status: "No token" });
  }

  jwt.verify(token, secret, (error, decoded) => {
    if (error) return res.status(403).json({ message: "Token invalid" });
    return res.status(200).json({ status: "pass", user: decoded });
  });
});
//logout
app.get("/api/logout", (req, res) => {
  const cookie = req.cookies["authcookie"];
  if (cookie) {
    res.clearCookie("authcookie");
    return res.status(200).json({ status: "success" });
  }
  res.end();
});
//api register
app.post("/api/register", registerValidator, (req, res) => {
  //validation result
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.json({ message: "Validation Error" });
  }
  //query
  const query =
    "INSERT INTO Users(username,email,fname,lname,password,createdAt) Values(?,?,?,?,?,?)";
  //req data from body
  const data = [
    req.body.username,
    req.body.email,
    req.body.fname,
    req.body.lname,
    
  ];
  //start hash
  bcrypt.hash(req.body.password, saltRounds, (error, hash) => {
    if (error) res.status(400).json({ message: "hash failed" });
    //start query
    sql.query(query, [...data, hash,new Date()], (err) => {
      if (err) {
        return res.status(400).json({ message: "Error register" });
      }
      const { username, email, fname } = req.body;
      const token = jwt.sign({ username, email, fname }, secret, {
        expiresIn: "1day",
      });
      res.cookie("authcookie", token, { httpOnly: true, maxAge: 86400000 });
      res.status(200).json({ status: "success" });
    });
  });
});
// login
app.post("/api/login", loginValidator, (req, res) => {
  const query = "SELECT * FROM Users where username = ?";

  //validation result and check validation
  const vali = validationResult(req);
  if (!vali.isEmpty()) {
    return res.status(400).json({ message: "Validation Error" });
  }

  const username = req.body.username;
  const password = req.body.password;

  sql.query(query, [username], (err, result) => {
    if (err) return res.status(500).json({ message: "Error query" });

    if (result.length == 0) {
      return res.status(401).json({ status: "No User" });
    }

    const user = result[0];
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).json({ message: "Error comparing" });
      if (!result) {
        return res.status(401).json({ status: "wrong password" });
      }
      const { id,username, email, fname } = user;
      const token = jwt.sign({ username, email, fname }, secret, {
        expiresIn: "1day",
      });
      res.cookie("authcookie", token, { httpOnly: true, maxAge: 86400000 });

      return res.status(200).json({ status: "pass" });
    });
  });
});

//create blog
app.post("/api/create",auth, insertValidator, (req, res) => {

  const user = req.user
  const query =
    "INSERT INTO Blog(title,description,urlToImage,publishedAt,content,catagory,author) VALUES(?)";
  
  //check validator
  const error = validationResult(req);
  if (!error.isEmpty()) return res.json({ message: "Validation Error" });
  
  const data = [
    req.body.title,
    req.body.description,
    req.body.urlToImage,
    req.body.publishedAt,
    req.body.content,
    req.body.catagory,
    user.username
  ];

  sql.query(query, [data], (error) => {
    if (error) {
      
      return res.status(500).json({ message: error });
    }
    res.status(200).json({ message: "Success" });
    res.end();
  });
});

//get blogs
app.get("/api/getblog", (req, res) => {
  try {
    const query = "SELECT * FROM Blog";
    sql.query(query, (err, result) => {
      if (err) res.status(404).json({ status: "No blog is here" });
      res.json({ result });
      res.end();
    });
  } catch (error) {}
});

//blog delete
app.post("/api/blog/delete/:id",auth,(req,res)=>{

    const query = "DELETE FROM Blog where id = ?"
    const id = req.params.id
    sql.query(query,[id],(err)=>{
      if(err) return res.status(500).json({msg : "Delete error"})
      res.status(200).json({status : "Success"})
      res.end()
    })
    
    

})

//get total project,client
app.get('/api/getallnum',auth,(req,res)=>{

})

//get all user
app.get('/api/user/getall' , auth ,(req,res)=>{
  
  const query = "SELECT username,fname,urlToImage,email  FROM Users"
  sql.query(query,(err,result)=>{
    if(err) return res.status(500).json({message : "Error"})
    if (result.length === 0) return res.status(404).json({message : "No data"})
    res.status(200).json({result : result})
    res.end()
  })
})

//getblog by id 
app.get('/api/blog/:id',(req,res)=>{
  const query = "Select * from Blog where id= ?"
  const id = req.params.id

  sql.query(query,[id],(err,result)=>{
    if(err) return res.status(500).json({status : "Server error"})
    if(result.length === 0 ) return res.status(404).json({message : "No blog"})
    res.status(200).json(result)
    res.end()
  })
})

//post
app.put('/api/blog/edit/:id',auth,(req,res)=>{
  const query = "UPDATE Blog SET title = ? ,description = ? ,urlToImage = ?,catagory = ? ,content= ? where id = ?"

  sql.query(query,[req.body.title,req.body.description,req.body.urlToImage,req.body.catagory,req.body.content,req.params.id],(err)=>{
    if(err) return res.status(500).json({message:err})
    res.status(200).json({status:"success"  })
    res.end()
   
  })
})

//get total data
app.get('/api/data/gettotal',auth,(req,res)=>{
    const query1 = "SELECT COUNT(*) as Users FROM Users;"
    const query2 = "SELECT COUNT(*) as Blog FROM Blog;"
    sql.query(query1,(err,result1)=>{
      if(err) return res.status(500).json({status : "Server error" , err})
      sql.query(query2,(err,result2)=>{
        if(err) return res.status(500).json({status : "Server error" , err})
        res.status(200).json({Blog : result2,Users : result1})
        res.end()
    })
    })
    
})

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Server is running on PORT ${PORT}`);
});
