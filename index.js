const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {z} = require("zod");
const app = express();
const jwt_secret = "IamPankajSingh";
const {UserModel,TodoModel} = require("./db");
app.use(express.json());
mongoose.connect("");
app.post("/signup",async (req,res)=>{
    const requiredBody = z.object({
        username : z.string().min(3,"Enter minimum 3 characters in Username"),
        password : z.string().min(5,"Enter minimum 5 characters Password")
        .max(30,"Maximum 30 characters allowed only")
        .regex(/[A-Z]/,"Password must contain one capital letter")
        .regex(/\d/,"Password must contain one number")
        .regex(/[@$!%*?&#]/,"Password must contain one special character")
    })
    const parsedBody = requiredBody.safeParse(req.body);
    if(!parsedBody.success){
        if(parsedBody.error.format().username){
            return res.json({msg : parsedBody.error.format().username._errors[0]})
        }else{
            return res.json({msg : parsedBody.error.format().password._errors[0]})
        }
    }
    try{
        const exist = await UserModel.findOne({
            username : req.body.username
        })
        if(exist){
            return res.json({msg : "User already Exist"});
        }
        const hashPassword = await bcrypt.hash(req.body.password,5);
        const newuser = await UserModel.create({
            username : req.body.username,
            password : hashPassword
        })
        res.json({msg : "User created Successfully",signup : true});
    }catch(error){
        console.log(error);
        res.json({msg : "User already exist",signup : false});
    }
});

app.post("/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const user = await UserModel.findOne({
            username: username
        });
        if(!user){
            res.status(402).json({ msg: "User not found" });
            return;
        }
        const match = await bcrypt.compare(password,user.password);
        if (match) {

            const token = jwt.sign({ _id: user._id }, jwt_secret);
            res.json({
                token: token,
                msg: "SignIn Successful"
            });
        } else {
            res.status(402).json({ msg: "Wrong password" });
        }
    } catch (error) {
        console.log(error);
        res.status(402).json({ msg: "Some problem occurred" });
    }
});



function auth(req,res,next){
    const token = req.headers.token;
    try{
        const user = jwt.verify(token,jwt_secret);

        if(user){
            req.user = user;
            next();
        }else{
            res.json({msg : "User not Exist"});
        }
    }catch(error){
        console.log(error);
        res.status(500).json({ msg: "Failed to authenticate" });
    }
}

app.post("/createTodo",auth,async (req,res)=>{

    const user = req.user;
    const title = req.body.title;
    const done = req.body.done;
    try{
        const response = await TodoModel.create({
            title : title,
            done : done,
            userid : user._id
        });
        res.status(201).json({ msg: "Todo created successfully" });
    }catch(error){
        console.log(error);
        res.status(500).json({ msg: "Failed to create todo"});
    }
});


app.post("/deleteTodo", auth, async (req, res) => {
    const user = req.user;
    const todoid = req.body.todoid;

    try {
        const response = await TodoModel.findOneAndDelete({
            userid: user._id,
            _id: todoid
        });

        if (response) {
            return res.status(200).json({ msg: "Todo Deleted" });
        } else {
            return res.status(404).json({ msg: "Todo not found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Failed to delete todo" });
    }
});

app.post("/updateTodo", auth, async (req, res) => {
    const user = req.user;
    const title = req.body.title;
    const todoid = req.body.todoid;

    try {
        const response = await TodoModel.findOneAndUpdate(
            { userid: user._id, _id: todoid },
            { title: title }
        );

        if (response) {
            return res.status(200).json({ msg: "Todo updated successfully" });
        } else {
            return res.status(404).json({ msg: "Todo not found or not authorized to update" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Failed to update todo" });
    }
});

app.get("/todos",auth,async (req,res)=>{
    const user = req.user;
    try{
        const todos = await TodoModel.find({
            userid : user._id
        });
        res.json({todos : todos})
    }catch(error){
        console.log(error);
        res.status(402).json({msg : "Failed in fetching Todos"});
    }
});

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log("Server running on port 3000.");
});
