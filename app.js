require("dotenv").config();
require("./config/db").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('./model/user');
const user = require("./model/user");
const app = express();

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

module.exports = app;