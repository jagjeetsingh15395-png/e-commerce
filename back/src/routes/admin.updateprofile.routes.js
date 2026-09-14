const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminController = require('../controller/admin.updateprofile.controller');


router.post('/addprofile', authMiddleware, adminController.postProfile);
router.get('/getprofile', authMiddleware, adminController.getProfile);
router.put('/updateprofile', authMiddleware, adminController.updateProfile);

module.exports = router;