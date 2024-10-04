const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const jwt_secret = "pankajZindaHai";
const app = express();
app.use(express.json());
const { UserModel, TodoModel } = require("./db");
mongoose.connect("mongodb+srv://pankaj42se:sKjeJTZYUDQkCdIz@cluster0.wjy2t.mongodb.net/");
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
app.post("/todos", auth, async (req, res) => {
    try {
        const user = req.user;
        const title = req.body.title;
        const done = req.body.done;

        // Ensure user ID is used correctly
        await TodoModel.create({
            done: done,
            title: title,
            userid: user._id // Assuming the user object contains the _id
        });

        res.status(201).json({ msg: "Todo created successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Failed to create todo", error });
    }
}); 

app.get("/todos",auth,async (req,res)=>{
    const user = req.user;
    const tasks = await TodoModel.find({ userid: user._id});
    console.log(tasks);
    let todo = [];
    for(let i of tasks){
        todo.push(i.title);
    }
    console.log(todo);
    res.json({msg : "Successfull"});
})

function auth(req,res,next){
    const token = req.headers.token;
    try{
        const user = jwt.verify(token, jwt_secret);
    if(user){
        req.user = user;
        next();
    }else{
        res.status(402).json("User not Exist");
    }
    }catch(error){
        res.json({msg:"Failed"})
    }
}

app.listen(3000);
