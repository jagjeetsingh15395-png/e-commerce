const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.login.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/send-otp', adminController.sendOTP);
router.post('/verify-otp', adminController.verifyOTP);
router.post('/logout', authMiddleware, adminController.logout);
router.post('/refresh-token', authMiddleware, adminController.refreshAccessToken);

module.exports = router;

