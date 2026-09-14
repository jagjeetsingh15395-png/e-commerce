const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');

router.get('/users', userController.getAdminProfile);
router.get('/users/Project', userController.getAllProjects);
router.get('/users/Project/:id', userController.getProjectsById);
router.get('/users/About', userController.getAbout);
router.get('/users/blog', userController.getBlog);
router.get('/users/blog/:id', userController.getBlogById);

module.exports = router;