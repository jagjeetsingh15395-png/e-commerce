const Project = require('../models/admin.project');
const Blog = require('../models/admin.blog');

exports.getAdminProfile = async (req, res) => {
  try {
    res.status(200).json({ message: 'Admin profile' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ _id: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProjectsById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAbout = async (req, res) => {
  try {
    const Profile = require('../models/admin.updateprofile');
    const profile = await Profile.findOne({});
    
    if (profile) {
      res.status(200).json({
        name: profile.name,
        about: profile.about,
        skills: profile.skills,
        githubURL: profile.githubURL,
        linkedinURL: profile.LinkedINURL,
        email: profile.EmailLink
      });
    } else {
      res.status(200).json({
        name: 'Admin',
        about: 'This portfolio showcases projects, blogs, and admin management features.',
        skills: 'Web Development, JavaScript, React, Node.js, MongoDB',
        githubURL: '',
        linkedinURL: '',
        email: ''
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ date: -1 });
    res.status(200).json({ blogs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ blog });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
