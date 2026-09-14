const Blog = require("../models/admin.blog");

exports.createBlog = async (req, res) => {
  try {
    const { category, title, shortDescription, content } = req.body;
    if (!category || !title || !shortDescription || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newBlog = new Blog({
      category: category.trim(),
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      content: content.trim(),
    });
    await newBlog.save();
    res.status(201).json({ blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.status(200).json({ blogs });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ blog });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { category, title, shortDescription, content } = req.body;
    if (!category && !title && !shortDescription && !content) {
      return res.status(400).json({ message: "At least one field is required to update" });
    };
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    blog.category = category.trim();
    blog.title = title.trim();
    blog.shortDescription = shortDescription.trim();
    blog.content = content.trim();
    await blog.save();
    res.status(200).json({ message: "Blog updated successfully", blog });


    /* const updatedData = {};
    if (category) updatedData.category = category.trim();
    if (title) updatedData.title = title.trim();
    if (shortDescription) updatedData.shortDescription = shortDescription.trim();
    if (content) updatedData.content = content.trim();
    const blog = await Blog.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "Blog updated successfully", blog }); */
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
