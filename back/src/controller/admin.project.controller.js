const Project = require('../models/admin.project');

exports.createProjects = async (req, res) => {
  try {
    const { title, description, imageUrl, githubLink, liveLink } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    };
    if (imageUrl && !isValidUrl(imageUrl)) {
      return res.status(400).json({ message: 'Invalid image URL' });
    }

    if(githubLink && !isValidUrl(githubLink)) {
      return res.status(400).json({ message: 'Invalid GitHub URL' });
    }
    if (liveLink && !isValidUrl(liveLink)) {
      return res.status(400).json({ message: 'Invalid project URL' });
    }
    const project = new Project({
      title: title.trim(),
      description: description.trim(),
      githubLink: githubLink || '',
      liveLink: liveLink || '',
      imageUrl: imageUrl || ''
    });
    await project.save();
    res.status(201).json({ message: 'Project created successfully', project }); 
  }catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProjects = async (req, res) => {
 try {
    const projects = await Project.find({});
    res.status(200).json({ projects });
  }catch (error) {
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
  }catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateProjectsById = async (req, res) => {
  try {
    const { title, description, imageUrl, githubLink, liveLink } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required'
      });
    }
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    };
    if (imageUrl && !isValidUrl(imageUrl)) {
      return res.status(400).json({
        message: 'Invalid image URL'
      });
    }
    if (githubLink && !isValidUrl(githubLink)) {
      return res.status(400).json({
        message: 'Invalid GitHub URL'
      });
    }
    if (liveLink && !isValidUrl(liveLink)) {
      return res.status(400).json({
        message: 'Invalid project URL'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }
    project.title = title.trim();
    project.description = description.trim();
    project.githubLink = githubLink || '';
    project.liveLink = liveLink || '';
    project.imageUrl = imageUrl || '';
    await project.save();

    res.status(200).json({
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error('Error updating project:', error);

    res.status(500).json({
      message: 'Server error'
    });
  }
};
exports.deleteProjectsById = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  }catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
