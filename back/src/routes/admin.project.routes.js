const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.project.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/createProjects', authMiddleware, adminController.createProjects);
router.get('/getprojects', authMiddleware, adminController.getAllProjects);
router.get('/getproject/:id', authMiddleware, adminController.getProjectsById);
router.put('/updateproject/:id', authMiddleware, adminController.updateProjectsById);
router.delete('/deleteproject/:id', authMiddleware, adminController.deleteProjectsById);

module.exports = router;