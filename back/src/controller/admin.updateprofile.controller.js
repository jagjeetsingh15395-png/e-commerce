const Profile = require('../models/admin.updateprofile');

exports.postProfile = async (req, res) => {
  try {
    const { name, about, skills, githubURL, LinkedINURL, EmailLink } = req.body;
    if (!name || !about) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if(name.length < 5 || name.length > 20) {
      return res.status(400).json({ message: 'Name must be between 5 and 20 characters' });
    }
    const emailValue = (EmailLink || '').trim();
    if (emailValue) {
      if (!emailValue) {
        return res.status(400).json({ message: 'Invalid email or mailto link' });
      }
    }
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    };
    if (githubURL && !isValidUrl(githubURL)) {
      return res.status(400).json({ message: 'Invalid GitHub URL' });
    }
    if (LinkedINURL && !isValidUrl(LinkedINURL)) {
      return res.status(400).json({ message: 'Invalid LinkedIn URL' });
    }

    const profile = new Profile({
      name: name.trim(),
      about: about.trim(),
      skills: Array.isArray(skills) ? skills.join(', ') : String(skills || '').trim(),
      githubURL: githubURL || '',
      LinkedINURL: LinkedINURL || '',
      EmailLink: emailValue
    });
    await profile.save();
    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({});
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, about, skills, githubURL, LinkedINURL, EmailLink } = req.body;

    if (!name || !about) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (name.length < 5 || name.length > 20) {
      return res.status(400).json({ message: 'Name must be between 5 and 20 characters' });
    }
    const emailValue = (EmailLink || '').trim();
    if (emailValue) {
      const emailRegex = /^(mailto:)?[^\s@]+@[^\s@]+\.[^\s@]+$/i;
      if (!emailRegex.test(emailValue)) {
        return res.status(400).json({ message: 'Invalid email or mailto link' });
      }
    }
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    };
    if (githubURL && !isValidUrl(githubURL)) {
      return res.status(400).json({ message: 'Invalid GitHub URL' });
    }
    if (LinkedINURL && !isValidUrl(LinkedINURL)) {
      return res.status(400).json({ message: 'Invalid LinkedIn URL' });
    }
    const profile = await Profile.findOne({});
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.name = name.trim();
    profile.about = about.trim();
    profile.skills = Array.isArray(skills) ? skills.join(', ') : String(skills || '').trim();
    profile.githubURL = githubURL || '';
    profile.LinkedINURL = LinkedINURL || '';
    profile.EmailLink = emailValue;

    await profile.save();
    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

