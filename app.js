require("dotenv").config();
require("./config/db").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('./model/user');
const ToDo = require("./model/todo");
const app = express();
const {verifyToken} = require('./middleware/authenticateUser');

app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        if (!(req.body.email && req.body.password && req.body.first_name && req.body.last_name)) {
            return res.status(400).send({message:"Invalid input"});
        }
    
        const userExist = await User.findOne({email:req.body.email});
    
        if(userExist) {
            return res.status(409).send({message: "User already exists"});
        }
    
        let encryptedPassword = await bcrypt.hash(req.body.password, 10);
    
        const user = await User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email.toLowerCase(),
            password: encryptedPassword
        });
    
        const token = jwt.sign({
            user_id: user._id,
            email: req.body.email
        },
        process.env.SECRET,
        {
            expiresIn: "1h"
        }
        );

        res.status(201).send({
            success: true,
            token
        });
    } catch(error) {
        console.log(error);
        return res.status(500).send({message:"Internal server error. Please try again later"});
    }
    

});

app.post('/login', async (req, res) => {
    try {
        if (!(req.body.email && req.body.password)) {
            return res.status(400).send({message:"Invalid input"});
        }

        const user = await User.findOne({email: req.body.email});

        if(user && await bcrypt.compare(req.body.password, user.password)) {
            const token = jwt.sign({
                user_id: user._id,
                email: req.body.email
            },
            process.env.SECRET,
            {
                expiresIn: "1h"
            }
            );

            return res.status(200).send({
                success: true,
                token
            });
        }
        return res.status(400).send({message:"Invalid credentials"})
    } catch (error) {
        console.log(error);
        return res.status(500).send({message:"Internal server error. Please try again later"});
    }
});

app.post("/todo", verifyToken, async (req, res) => {
    try {
        if(!req.body.item) {
            return res.status(400).send({message:"Invalid input"});
        }
        const createdTodo = await ToDo.create({item: req.body.item});
    
        return res.status(201).send({
            success: true,
            todo: createdTodo
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message:"Internal server error. Please try again later"});
    }
});

app.get('/todo', verifyToken, async (req, res) => {
    try {
        const todoList = await ToDo.find();
    
        return res.status(200).send({
            success: true,
            todo: todoList
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message:"Internal server error. Please try again later"});
    }
})

app.put('/todo', verifyToken, async (req, res) => {
    try {
        if(!req.body.todoid) {
            return res.status(400).send({message:"Invalid input"});
        }
        const updatedTodo = await ToDo.findByIdAndUpdate(req.body.todoid, {item: req.body.item});
        if(!updatedTodo) {
            return res.status(400).send({message:"Bad request. Unable to update item"});
        }
        return res.status(200).send({
            success: true,
            message:"Item updated successfully",
            item: updatedTodo
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({message:"Internal server error. Please try again later"});
    }
})

app.delete('/todo', verifyToken, async (req, res) => {
    try {
        if(!req.body.todoid) {
            return res.status(400).send({message:"Invalid input"});
        }
        const deletedTodo = await ToDo.findByIdAndDelete(req.body.todoid);
        if(!deletedTodo) {
            return res.status(400).send({message:"Bad request. Unable to delete item"});
        }
        return res.status(200).send({
            success: true,
            message:"Item deleted successfully",
            item: deletedTodo
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({message:"Internal server error. Please try again later"});
    }
});

module.exports = app;