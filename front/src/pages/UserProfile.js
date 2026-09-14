import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Github, Linkedin, Mail, Twitter, ArrowRight } from "lucide-react";
import axios from "axios";

// Configure axios to include credentials
const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:6001/api",
});

const UserProfile = () => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({
    name: "",
    title: "",
    bio: "",
    longBio: "",
    email: "",
    socialLinks: {},
    skills: [],
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch admin profile (contains user info and social links)
        try {
          const profileResponse = await axiosInstance.get("/admin/getprofile");
          if (profileResponse.data && profileResponse.data.profile) {
            const profile = profileResponse.data.profile;
            setUserInfo({
              name: profile.name || "Admin",
              title: "Web Developer", // Default title
              bio:
                profile.about ||
                "I build responsive, fast, and engaging websites using modern web technologies.",
              longBio:
                profile.about ||
                "I'm a passionate web developer with experience in creating dynamic and user-friendly web applications. I specialize in JavaScript and have expertise in both front-end and back-end development.",
              email: profile.EmailLink || "admin@example.com",
              socialLinks: {
                github: profile.githubURL || "",
                linkedin: profile.LinkedINURL || "",
                twitter: profile.TwitterURL || "",
                email: profile.EmailLink || "",
              },
              // Map skills from string to array of objects
              skills: profile.skills
                ? profile.skills.split(",").map((skill) => ({
                    name: skill.trim(),
                    icon: getSkillIcon(skill.trim()),
                  }))
                : [],
            });
          }
        } catch (profileErr) {
          console.log("Could not fetch profile:", profileErr.message);
        }

        // Fetch projects
        try {
          const projectsResponse = await axiosInstance.get("/users/Project");
          if (projectsResponse.data && projectsResponse.data.projects) {
            const mappedProjects = projectsResponse.data.projects.map(
              (project) => ({
                id: project._id,
                title: project.title,
                description: project.description,
                image: project.imageUrl
                  ? project.imageUrl.substring(0, 4)
                  : "TASK", // Extract first 4 chars for icon
              }),
            );
            setProjects(mappedProjects);
          }
        } catch (projectsErr) {
          console.log("Could not fetch projects:", projectsErr.message);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.replace("#", "");
    const timer = window.setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  // Helper function to map skill names to icons
  const getSkillIcon = (skillName) => {
    const skillIcons = {
      HTML: "HTML",
      HTML5: "HTML",
      CSS: "CSS",
      CSS3: "CSS",
      JavaScript: "JS",
      JS: "JS",
      React: "RCT",
      "Node.js": "NODE",
      Node: "NODE",
      MongoDB: "DB",
      Express: "EXP",
      "Express.js": "EXP",
    };
    return skillIcons[skillName] || "CODE";
  };

  // Add loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        id="home"
        className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 scroll-mt-20"
      >
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Hi, I'm {userInfo.name}
            </h1>
            <p className="text-xl text-green-700 font-semibold mb-4">
              {userInfo.title}
            </p>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {userInfo.bio}
            </p>
            <div className="flex gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                View My Work
              </button>
              <button className="border-2 border-gray-300 hover:border-blue-600 text-gray-800 hover:text-blue-600 font-bold py-3 px-8 rounded-lg transition-colors">
                Contact Me
              </button>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <div className="text-6xl font-black tracking-[0.3em] text-blue-700">
                DEV
              </div>
              <div className="absolute top-10 right-10 text-xl font-bold text-sky-700 animate-bounce">
                WEB
              </div>
              <div className="absolute top-20 left-0 text-xl font-bold text-indigo-700">
                JS
              </div>
              <div className="absolute bottom-20 right-0 text-xl font-bold text-emerald-700">
                UI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section id="about" className="py-16 px-4 bg-white scroll-mt-20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            About Me
          </h2>

          <div className="bg-blue-50 rounded-lg p-8 mb-12">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {userInfo.longBio}
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-colors">
              Read More
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {userInfo.skills.map((skill, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="text-4xl mb-2">{skill.icon}</div>
                <p className="text-gray-700 font-semibold">{skill.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Projects Section */}
      <section id="projects" className="py-16 px-4 bg-gray-50 scroll-mt-20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Latest Projects
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Here are some of the projects I've worked on recently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex items-center justify-center">
                  <div className="text-6xl">{project.image}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{project.description}</p>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2">
                      View Project
                      <ArrowRight size={18} />
                    </button>
                    <button className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2">
                      <Github size={18} />
                      View Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 scroll-mt-20"
      >
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center px-4">
            Get In Touch
          </h2>
          <div className="bg-white shadow-lg w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full px-8 py-8">
              {/* Contact Info Card */}
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {userInfo.name}
                </h3>
                <p className="text-lg text-green-700 font-semibold mb-6">
                  {userInfo.title}
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Feel free to reach out! I'm always interested in hearing about
                  new projects and opportunities to work with innovative people
                  on interesting challenges.
                </p>

                {/* Social Links */}
                <div className="flex gap-4 mb-8">
                  {userInfo.socialLinks.github && (
                    <a
                      href={userInfo.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Github size={24} />
                    </a>
                  )}
                  {userInfo.socialLinks.linkedin && (
                    <a
                      href={userInfo.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={24} />
                    </a>
                  )}
                  {userInfo.socialLinks.twitter && (
                    <a
                      href={userInfo.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Twitter size={24} />
                    </a>
                  )}
                  {userInfo.socialLinks.email && (
                    <a
                      href={`mailto:${userInfo.socialLinks.email}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Mail size={24} />
                    </a>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 font-semibold mb-2">Email:</p>
                    <a
                      href={`mailto:${userInfo.email}`}
                      className="text-blue-600 hover:text-blue-800 text-lg break-all"
                    >
                      {userInfo.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold mb-2">
                      Location:
                    </p>
                    <p className="text-gray-600">Available for Remote Work</p>
                  </div>
                </div>
              </div>

              {/* Quick Contact Form */}
              <div className="w-full">
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200 h-full">
                  <h4 className="text-xl font-bold text-gray-800 mb-6">
                    Contact Form
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Message
                      </label>
                      <textarea
                        placeholder="Type your message here..."
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserProfile;
