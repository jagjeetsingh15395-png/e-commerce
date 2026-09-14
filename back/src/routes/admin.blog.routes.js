const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin.blog.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Create a new blog post
router.post("/createBlog", authMiddleware, adminController.createBlog);
router.get("/getAllBlogs", authMiddleware, adminController.getAllBlogs);
router.get("/getBlogById/:id", authMiddleware, adminController.getBlogById);
router.put("/updateBlog/:id", authMiddleware, adminController.updateBlog);
router.delete("/deleteBlog/:id", authMiddleware, adminController.deleteBlog);

module.exports = router;
