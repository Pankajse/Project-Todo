const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
    username : {type : String, unique: true},
    password : String
})
const Todo = new Schema({
    title : String,
    done : Boolean,
    userid : ObjectId
})

const UserModel = mongoose.model('users',User);
const TodoModel = mongoose.model('todo-list',Todo);

module.exports={
    UserModel,
    TodoModel
}
