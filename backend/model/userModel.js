const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "Please provide a unique username"],
        unique: [true, "Username exist"]
    },
    email: {
        type: String,
        require: [true, "Please provide a unique email"],
        unique: true
    },
    password: {
        type: String,
        require: [true, "Please provide a password"],
        unique: false
    },
    otp: {
        type: String,  
    },
    otpExpiry: {
        type: Date,
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    contact: {
        type: String
    },
    address: {
        type: String
    },
    image: {
        type: String
    }
})

const User = new mongoose.model('User', userSchema)
module.exports = User

