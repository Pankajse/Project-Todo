const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const jwt_secret = "pankajZindaHai";
const app = express();
app.use(express.json());
const { UserModel, TodoModel } = require("./db");
mongoose.connect("mongodb+srv://pankaj42se:<password>@cluster0.wjy2t.mongodb.net/todo-app");
app.post("/signup", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
        username: username,
        password: password,
        name: name
    });
    
    res.json({
        message: "You are signed up"
    })
});

app.post("/signin",async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const User = await UserModel.findOne({
        username : username,
        password : password
    })
    if(User){
        const token = jwt.sign({id : User._id},jwt_secret);
        res.json({
            token : token,
            msg : "SignIn Successful"
        })
    }else{
        res.status(403).json({
            msg : "User does not exist"
        })
    }
})
app.post("/todo",(req,res)=>{

})
app.get("/todos",(req,res)=>{

})

app.listen(3000);
