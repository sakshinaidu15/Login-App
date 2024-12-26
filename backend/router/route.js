const express = require('express')
const router = express.Router()
const appController = require('../controllers/app-controller')
const auth = require('./../middleware/auth')

router.post('/register', appController.register)
router.post('/login', appController.login)
router.get('/user', auth.Auth, appController.getUserByToken)
router.post('/send-otp', appController.sendOtp)
router.post('/verify-otp', appController.verifyOtp)
router.put('/edit', auth.Auth, appController.editUser)
router.post('/reset-password', appController.resetPassword)

module.exports = router