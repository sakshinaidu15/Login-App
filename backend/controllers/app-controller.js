const userSchema = require('./../model/userModel')
const bcrypt = require('bcrypt')
const path = require('path');
const filePath = path.join(__dirname, '..', 'assets');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const register = async (req, res) => {

    const { name, email, password } = req.body
    const image = req.files && req.files.image ? req.files.image : null;

    if (!name || !email || !password) {
        res.status(400).json({ msg: 'All fields are required' })
    }
    else {
        const existingUser = await userSchema.findOne({ $or: [{ name: name }, { email: email }] });
        if (existingUser) {
            res.status(400).json({ msg: 'Username or Email already exits' })
        }
        else {
            try {
                const hashedPass = await bcrypt.hash(password, 10)
                if (image) {
                    await image.mv(path.join(filePath, image.name));
                }
                const data = new userSchema({
                    name,
                    email,
                    password: hashedPass,
                    image: image ? image.name : "",


                })
                const dataCreated = await data.save()
                res.status(201).json({ msg: dataCreated })
            }
            catch (error) {
                console.log(error)
                res.status(400).json({ msg: 'Unable to register' })

            }
        }
    }
}
const login = async (req, res) => {
    try {
        const { name, password } = req.body
        if (name && password) {
            const userExist = await userSchema.findOne({ name: name })
            if (userExist) {
                const isMatch = await bcrypt.compare(password, userExist.password)
                if ((userExist.name === name) && isMatch) {
                    const token = jwt.sign({ id: userExist._id, name: userExist.name }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' })
                    res.status(200).json({ msg: 'You have logged in', name: userExist.name, token })
                }
                else {
                    res.status(400).json({ msg: 'Username or password is not valid' })
                }
            }
            else {
                res.status(400).json({ msg: 'You are not a registered user' })
            }
        }
        else {
            res.status(400).json({ msg: 'All fields are required' })
        }
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ msg: 'Unable to login' })
    }

}

// const getUser = async (req, res) => {
//     const id = req.params.id
//     try {
//       const user = await userSchema.findOne({ _id: id }).select("-password")

//       if (!user) {
//         return res.status(404).json({ message: "User not found" })
//       } else {
//         res.status(200).json({ message: "Data Get Successfully", user })
//       }
//     } catch (err) {
//       res.status(400).json({ message: "Failed" })
//     }
//   }

const getUserByToken= async (req, res) => {
    const id = req.user.id
    try {
      const user = await userSchema.findOne({ _id: id }).select('-password')

      if (!user) {
        return res.status(404).json({ msg: 'User not found' })
      } else {
        res.status(200).json(user)
      }
    } catch (err) {
      res.status(400).json({ msg : "Failed", err })
    }
  }


const editUser = async (req, res) => {
    
    const { id } = req.user
    const { firstName, lastName, contact, email, address } = req.body
    const image = req.files && req.files.image ? req.files.image : null

    try {
        if (image) {
            await image.mv(path.join(filePath, image.name))
        }
        const abc = await userSchema.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    firstName,
                    lastName,
                    contact,
                    address,
                    image: image ? image.name : undefined,
                },
            }
        )
        res.status(200).json(abc)
    } catch (error) {
        res.status(400).json({ msg : "Unable to update" })
    }

}
// Create transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'sakshinaidu17@gmail.com',
        pass: 'bdnb whay gyfk ojro',
    },
});
// Generate OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString()
}
// Generate OTP and send to user's email
const sendOtp = async (req, res) => {
    const { email } = req.body
    const user = await userSchema.findOne({ email })

    if (!user) {
        return res.status(404).json({ msg: 'User not found' })
    }

    const otp = generateOTP()
    user.otp = otp                                           // Store OTP in user schema
    user.otpExpiry = Date.now() + 15 * 60 * 1000             // OTP expires in 15 minutes
    // Save the updated user document with OTP
    await user.save()


    // Send OTP via email
    const mailOptions = {
        from: 'sakshinaidu17@gmail.com',
        to: user.email,
        subject: 'Password Recovery OTP',
        text: `Your OTP for password recovery is ${otp}. It is valid for 15 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ msg: 'Error sending OTP email', error })
        }
        res.status(200).json({ msg: 'OTP sent to email' })
    })
}

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    // Find user by email
    const user = await userSchema.findOne({ email })

    if (!user) {
        return res.status(404).json({ msg: 'User not found' })
    }

    // Check if OTP is correct and not expired
    if (user.otp !== otp) {
        return res.status(400).json({ msg: 'Invalid OTP' })
    }

    const currentTime = Date.now();
    if (currentTime > user.otpExpiry) {
        return res.status(400).json({ msg: 'OTP has expired' })
    }

    // If OTP is valid, clear OTP and otpExpiry, and respond with success
    user.otp = null
    user.otpExpiry = null
    await user.save()

    res.status(200).json({ msg: 'OTP verified successfully' })
}

const resetPassword = async (req, res) => {
    const { email, newPassword, confirm_password } = req.body

    const user = await userSchema.findOne({ email })

    if (!user) {
        return res.status(404).json({ msg: 'User not found' })
    }

    // Ensure the OTP has already been verified by checking if it's cleared
    if (user.otp !== null || user.otpExpiry !== null) {
        return res.status(400).json({ msg: 'OTP verification required' })
    }
    if (newPassword !== confirm_password) {
        return res.status(400).json({ msg: 'Passwords do not match' })
    }
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Save the new password
        user.password = hashedPassword
        await user.save()

        res.status(200).json({ msg: 'Password reset successfully' })
    }
    catch (error) {
        res.status(500).json({ msg: 'Error resetting password', error })
    }
}




module.exports = { register, login, getUserByToken, editUser, sendOtp, verifyOtp, resetPassword }
