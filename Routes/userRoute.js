const express = require("express");
const UserRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.key)
const { UserModel } = require("../Model/userModel")
UserRouter.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await UserModel.findOne({ email })
        if (exists) {
            return res.status(400).json({ "ok": false, "mssg": "User already registered" })
        }
        const hashed = await bcrypt.hash(password, 10);
        const token = jwt.sign({ email }, process.env.Secret, { expiresIn: "2h" })
        const verificationURL = `http://localhost:4500/api/verify/${token}`;
        const user = new UserModel({
            name,
            email,
            password: hashed
        })
        await user.save();
        const mailOptions = {
            to: email,
            from: process.env.Email,
            subject: 'Email Verification',
            html: `
            <p>Hello ${name},</p>
            <p>Please Verify Your Email by clicking on the Link Below</p>
            <a href="${verificationURL}">${verificationURL}</a>
            `
        };
        sgMail.send(mailOptions)
            .then(() => {
                res.status(200).json({ "mssg": "Email  Sent Successfully" })
            })
            .catch((err) => {
                res.status(500).json({ "mssg": err.message })
            })
    } catch (error) {
        return res.status(500).json({ "mssg": error.message })
    }
})
UserRouter.get("/verify/:token", async (req, res) => {
    try {
        const token = req.params.token
        const decoded = jwt.verify(token, process.env.Secret);
        const email = decoded.email;
        const user = await UserModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ "mssg": "User not Found" })
        }
        user.isVerified = true;
        await user.save();
        res.redirect(`http://localhost:4500/api/login`)
    } catch (error) {
        return res.status(500).json({ "mssg": error.message })
    }
})
UserRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email});
        if (!user) {
            return res.status(401).json({ "mssg": "User with this email not found" })
        }
        if(user.isVerified===false){
            return res.status(401).json({ "mssg": "User not verified till now" })
        }
        const isSame = await bcrypt.compare(password,user.password)
        if(!isSame){
            return res.status(401).json({ "mssg": "Wrong credentials" })
        }
        const ftoken = jwt.sign({userId:user._id},process.env.verify_token,{expiresIn:"3h"})
        const response = {
            "ok":true,
            "token":ftoken,
            "mssg":"Login Successfull"
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({"mssg":error.message})
    }
})
module.exports = { UserRouter }