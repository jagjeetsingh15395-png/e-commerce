import React, { useEffect, useRef, useState } from "react";
import {
  Edit2,
  Trash2,
  Github,
  Link as LinkIcon,
  CheckCircle,
  X,
  Plus,
} from "lucide-react";
import BlogEditPage from "./BlogEditPage";
import axios from "axios";

// Configure axios to include credentials
const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:6001/api",
});

const AdminPanel = ({ initialSection = "home" }) => {
  const [projects, setProjects] = useState([]);
  const [adminInfo, setAdminInfo] = useState({
    name: "",
    about: "",
    skills: "",
    socialLinks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editAdminModal, setEditAdminModal] = useState(false);
  const [editBlogModal, setEditBlogModal] = useState(false);
  const [showBlogEditPage, setShowBlogEditPage] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    githubUrl: "",
    liveUrl: "",
    imageUrl: "",
  });
  const [adminFormData, setAdminFormData] = useState({
    name: "",
    about: "",
    skills: "",
    github: "",
    linkedin: "",
    twitter: "",
    email: "",
  });

  const [blogs, setBlogs] = useState([]);

  const [blogFormData, setBlogFormData] = useState({
    category: "",
    title: "",
    description: "",
    readTime: "",
    content: "",
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch projects - use user endpoint which doesn't require auth
        try {
          const projectsResponse = await axiosInstance.get("/users/Project");
          if (projectsResponse.data && projectsResponse.data.projects) {
            const mappedProjects = projectsResponse.data.projects.map(
              (project) => ({
                id: project._id,
                title: project.title,
                description: project.description,
                live: Boolean(project.liveLink),
                deployed: Boolean(project.githubLink),
                imageUrl: project.imageUrl || "",
                links: [
                  { icon: "github", url: project.githubLink },
                  { icon: "link", url: project.liveLink },
                ].filter((link) => link.url),
              }),
            );
            setProjects(mappedProjects);
          }
        } catch (projectErr) {
          console.log("Could not fetch projects:", projectErr.message);
        }

        // Fetch admin profile - try admin endpoint first, then fallback
        try {
          const profileResponse = await axiosInstance.get("/admin/getprofile");
          if (profileResponse.data && profileResponse.data.profile) {
            const profile = profileResponse.data.profile;
            const mappedAdminInfo = {
              name: profile.name,
              about: profile.about,
              skills: profile.skills,
              socialLinks: [
                { type: "github", url: profile.githubURL, label: "GitHub" },
                {
                  type: "linkedin",
                  url: profile.LinkedINURL,
                  label: "LinkedIn",
                },
                {
                  type: "twitter",
                  url: profile.TwitterURL || "",
                  label: "Twitter",
                },
                { type: "email", url: profile.EmailLink, label: "Email" },
              ].filter((link) => link.url),
            };
            setAdminInfo(mappedAdminInfo);
            setAdminFormData({
              name: profile.name,
              about: profile.about,
              skills: profile.skills,
              github: profile.githubURL,
              linkedin: profile.LinkedINURL,
              twitter: profile.TwitterURL || "",
              email: profile.EmailLink,
            });
          }
        } catch (profileErr) {
          console.log("Could not fetch admin profile:", profileErr.message);
          // Set default admin info if no profile exists
          setAdminInfo({
            name: "Admin",
            about: "Administrator account",
            skills: "",
            socialLinks: [],
          });
        }

        // Fetch blogs - use user endpoint which doesn't require auth
        try {
          const blogsResponse = await axiosInstance.get("/users/blog");
          if (blogsResponse.data && blogsResponse.data.blogs) {
            const mappedBlogs = blogsResponse.data.blogs.map((blog) => ({
              id: blog._id,
              category: blog.category,
              title: blog.title,
              description: blog.shortDescription,
              date: new Date(blog.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              readTime: "5 min",
              content: blog.content,
            }));
            setBlogs(mappedBlogs);
          }
        } catch (blogsErr) {
          console.log("Could not fetch blogs:", blogsErr.message);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch some admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const homeSectionRef = useRef(null);
  const projectsSectionRef = useRef(null);
  const profileSectionRef = useRef(null);
  const blogsSectionRef = useRef(null);

  useEffect(() => {
    if (showBlogEditPage) {
      return;
    }

    const sectionRefs = {
      home: homeSectionRef,
      projects: projectsSectionRef,
      profile: profileSectionRef,
      blogs: blogsSectionRef,
    };

    const activeSection = sectionRefs[initialSection]?.current;

    if (activeSection) {
      activeSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [initialSection, showBlogEditPage]);

  const scrollToSection = (sectionRef) => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setProjectFormData({
      title: project.title,
      description: project.description || "",
      githubUrl: project.links.find((l) => l.icon === "github")?.url || "",
      liveUrl: project.links.find((l) => l.icon === "link")?.url || "",
      imageUrl: project.imageUrl || "",
    });
    setEditProjectModal(true);
  };

  const handleAddProject = () => {
    setSelectedProject(null);
    setProjectFormData({
      title: "",
      description: "",
      githubUrl: "",
      liveUrl: "",
      imageUrl: "",
    });
    setEditProjectModal(true);
  };

  const handleSaveProject = async () => {
    try {
      const projectData = {
        title: projectFormData.title,
        description: projectFormData.description,
        imageUrl: projectFormData.imageUrl,
        githubLink: projectFormData.githubUrl,
        liveLink: projectFormData.liveUrl,
      };

      if (selectedProject) {
        // Update existing project
        await axiosInstance.put(
          `/admin/updateproject/${selectedProject.id}`,
          projectData,
        );
      } else {
        // Create new project
        await axiosInstance.post("/admin/createProjects", projectData);
      }

      // Refresh projects list from user endpoint (doesn't require auth)
      try {
        const response = await axiosInstance.get("/users/Project");
        if (response.data && response.data.projects) {
          const mappedProjects = response.data.projects.map((project) => ({
            id: project._id,
            title: project.title,
            description: project.description,
            live: Boolean(project.liveLink),
            deployed: Boolean(project.githubLink),
            imageUrl: project.imageUrl || "",
            links: [
              { icon: "github", url: project.githubLink },
              { icon: "link", url: project.liveLink },
            ].filter((link) => link.url),
          }));
          setProjects(mappedProjects);
        }
      } catch (refreshErr) {
        // Fallback: update local state if backend refresh fails
        if (selectedProject) {
          const updatedProjects = projects.map((p) =>
            p.id === selectedProject.id
              ? {
                  ...p,
                  title: projectFormData.title,
                  description: projectFormData.description,
                  imageUrl: projectFormData.imageUrl,
                  links: [
                    { icon: "github", url: projectFormData.githubUrl },
                    { icon: "link", url: projectFormData.liveUrl },
                  ].filter((link) => link.url),
                  live: Boolean(projectFormData.liveUrl),
                  deployed: Boolean(projectFormData.githubUrl),
                }
              : p,
          );
          setProjects(updatedProjects);
        } else {
          const newProject = {
            id: Date.now(), // Temporary ID
            title: projectFormData.title,
            description: projectFormData.description,
            imageUrl: projectFormData.imageUrl,
            links: [
              { icon: "github", url: projectFormData.githubUrl },
              { icon: "link", url: projectFormData.liveUrl },
            ].filter((link) => link.url),
            live: Boolean(projectFormData.liveUrl),
            deployed: Boolean(projectFormData.githubUrl),
          };
          setProjects([newProject, ...projects]);
        }
      }

      setSelectedProject(null);
      setEditProjectModal(false);
    } catch (err) {
      setError(err.message || "Failed to save project");
    }
  };

  const handleCreateBlog = () => {
    setSelectedBlog(null);
    setBlogFormData({
      category: "",
      title: "",
      description: "",
      readTime: "",
      content: "",
    });
    setShowBlogEditPage(true);
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setBlogFormData({
      category: blog.category,
      title: blog.title,
      description: blog.description,
      readTime: blog.readTime,
      content: blog.content || "",
    });
    setShowBlogEditPage(true);
  };

  const handleSaveBlog = async (formData) => {
    try {
      const blogData = {
        category: formData.category,
        title: formData.title,
        shortDescription: formData.description,
        content: formData.content,
      };

      if (selectedBlog) {
        // Edit existing blog
        await axiosInstance.put(
          `/admin/updateBlog/${selectedBlog.id}`,
          blogData,
        );
      } else {
        // Create new blog
        await axiosInstance.post("/admin/createBlog", blogData);
      }

      // Refresh blogs list
      const response = await axiosInstance.get("/admin/getAllBlogs");
      if (response.data && response.data.blogs) {
        const mappedBlogs = response.data.blogs.map((blog) => ({
          id: blog._id,
          category: blog.category,
          title: blog.title,
          description: blog.shortDescription,
          date: new Date(blog.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          readTime: "5 min",
          content: blog.content,
        }));
        setBlogs(mappedBlogs);
      }

      setShowBlogEditPage(false);
      setSelectedBlog(null);
    } catch (err) {
      setError(err.message || "Failed to save blog");
    }
  };

  const handleCancelBlog = () => {
    setShowBlogEditPage(false);
    setSelectedBlog(null);
  };

  const handleDeleteBlog = async (id) => {
    try {
      await axiosInstance.delete(`/admin/deleteBlog/${id}`);
      // Refresh blogs list
      const response = await axiosInstance.get("/admin/getAllBlogs");
      if (response.data && response.data.blogs) {
        const mappedBlogs = response.data.blogs.map((blog) => ({
          id: blog._id,
          category: blog.category,
          title: blog.title,
          description: blog.shortDescription,
          date: new Date(blog.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          readTime: "5 min",
          content: blog.content,
        }));
        setBlogs(mappedBlogs);
      }
    } catch (err) {
      setError(err.message || "Failed to delete blog");
    }
  };

  const handleEditAdmin = () => {
    setAdminFormData({
      name: adminInfo.name,
      about: adminInfo.about,
      skills: adminInfo.skills,
      github: adminInfo.socialLinks.find((l) => l.type === "github")?.url || "",
      linkedin:
        adminInfo.socialLinks.find((l) => l.type === "linkedin")?.url || "",
      twitter:
        adminInfo.socialLinks.find((l) => l.type === "twitter")?.url || "",
      email: adminInfo.socialLinks.find((l) => l.type === "email")?.url || "",
    });
    setEditAdminModal(true);
  };

  const handleSaveAdmin = async () => {
    try {
      const profileData = {
        name: adminFormData.name,
        about: adminFormData.about,
        skills: adminFormData.skills,
        githubURL: adminFormData.github,
        LinkedINURL: adminFormData.linkedin,
        EmailLink: adminFormData.email,
      };

      // Check if we have an existing profile
      const profileResponse = await axiosInstance.get("/admin/getprofile");
      if (profileResponse.data && profileResponse.data.profile) {
        // Update existing profile
        await axiosInstance.put("/admin/updateprofile", profileData);
      } else {
        // Create new profile
        await axiosInstance.post("/admin/addprofile", profileData);
      }

      // Refresh admin info
      const updatedProfileResponse =
        await axiosInstance.get("/admin/getprofile");
      if (updatedProfileResponse.data && updatedProfileResponse.data.profile) {
        const profile = updatedProfileResponse.data.profile;
        const mappedAdminInfo = {
          name: profile.name,
          about: profile.about,
          skills: profile.skills,
          socialLinks: [
            { type: "github", url: profile.githubURL, label: "GitHub" },
            { type: "linkedin", url: profile.LinkedINURL, label: "LinkedIn" },
            {
              type: "twitter",
              url: profile.TwitterURL || "",
              label: "Twitter",
            },
            { type: "email", url: profile.EmailLink, label: "Email" },
          ].filter((link) => link.url),
        };
        setAdminInfo(mappedAdminInfo);
      }

      setEditAdminModal(false);
    } catch (err) {
      setError(err.message || "Failed to save admin profile");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/deleteproject/${id}`);
      // Refresh projects list from user endpoint
      try {
        const response = await axiosInstance.get("/users/Project");
        if (response.data && response.data.projects) {
          const mappedProjects = response.data.projects.map((project) => ({
            id: project._id,
            title: project.title,
            description: project.description,
            live: Boolean(project.liveLink),
            deployed: Boolean(project.githubLink),
            imageUrl: project.imageUrl || "",
            links: [
              { icon: "github", url: project.githubLink },
              { icon: "link", url: project.liveLink },
            ].filter((link) => link.url),
          }));
          setProjects(mappedProjects);
        }
      } catch (refreshErr) {
        // Fallback: update local state if backend refresh fails
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch (err) {
      setError(err.message || "Failed to delete project");
    }
  };

  // Add loading state to UI, but always show UI even with errors
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading admin data...</p>
      </div>
    );
  }

  return (
    <>
      {showBlogEditPage && (
        <BlogEditPage
          blog={selectedBlog}
          onSave={handleSaveBlog}
          onCancel={handleCancelBlog}
        />
      )}

      {!showBlogEditPage && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
          {/* Error notification banner */}
          {error && (
            <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              <p className="text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          )}
          <div className="container mx-auto">
            {/* Welcome Section */}
            <div
              ref={homeSectionRef}
              id="admin-home"
              className="bg-white rounded-lg shadow-md p-8 mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Welcome, Admin!
              </h1>
              <p className="text-gray-600 mb-6">
                Manage your profile through the{" "}
                <span className="font-semibold">admin panel</span>
              </p>
              <p className="text-gray-600 mb-6">
                You can update your profile, add new project or delete old
                project or manage them
              </p>
              <button
                onClick={() => scrollToSection(profileSectionRef)}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors"
              >
                View My Profile
              </button>
            </div>

            <div
              ref={projectsSectionRef}
              id="admin-projects"
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Projects Section */}
              <div className="lg:col-span-2">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
                  <button
                    onClick={handleAddProject}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <Plus size={18} /> Add New Project
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">
                            Title
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">
                            Live
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">
                            Deployed
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => (
                          <tr
                            key={project.id}
                            className="border-t hover:bg-blue-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-gray-700">
                              {project.id}
                            </td>
                            <td className="px-6 py-4 text-gray-700 font-medium">
                              {project.title}
                            </td>
                            <td className="px-6 py-4">
                              {project.live ? (
                                <CheckCircle
                                  className="text-green-500"
                                  size={20}
                                />
                              ) : (
                                <X className="text-red-500" size={20} />
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {project.deployed ? (
                                <CheckCircle
                                  className="text-green-500"
                                  size={20}
                                />
                              ) : (
                                <X className="text-red-500" size={20} />
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md ml-2 inline-flex items-center gap-2 transition-colors"
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Project Details Cards */}
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-md p-6 mb-6"
                  >
                    {project.imageUrl && (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {project.title}
                      </h3>
                      <button
                        onClick={() => handleEditProject(project)}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">
                      {project.description}
                    </p>

                    <div className="flex gap-4 mb-4">
                      {project.links.find((l) => l.icon === "github") && (
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <Github size={20} />
                          <a
                            href={`https://${project.links.find((l) => l.icon === "github")?.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Code
                          </a>
                        </button>
                      )}
                      {project.links.find((l) => l.icon === "link") && (
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <LinkIcon size={20} />
                          <a
                            href={
                              project.links.find((l) => l.icon === "link")?.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Live Demo
                          </a>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin Profile Section */}
              <div
                ref={profileSectionRef}
                id="admin-profile"
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-lg shadow-md p-8 sticky top-20">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                      About {adminInfo.name}
                    </h3>
                    <button
                      onClick={handleEditAdmin}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md inline-flex items-center gap-2 transition-colors"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 font-semibold">Name:</p>
                      <p className="text-gray-800">{adminInfo.name}</p>
                    </div>

                    <div>
                      <p className="text-gray-600 font-semibold">About:</p>
                      <p className="text-gray-800 text-sm">{adminInfo.about}</p>
                    </div>

                    <div>
                      <p className="text-gray-600 font-semibold">Skills</p>
                      <p className="text-gray-800">{adminInfo.skills}</p>
                    </div>

                    <div>
                      <p className="text-gray-600 font-semibold mb-4">
                        Social Links
                      </p>
                      <div className="space-y-3">
                        {adminInfo.socialLinks.map((link, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="capitalize text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {link.label}
                            </a>
                            <CheckCircle className="text-green-500" size={20} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Blogs Section */}
            <div ref={blogsSectionRef} id="admin-blogs" className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Blogs</h2>
                <button
                  onClick={handleCreateBlog}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} /> Write a New Blog
                </button>
              </div>

              {/* Blogs Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">
                          Title
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map((blog) => (
                        <tr
                          key={blog.id}
                          className="border-t hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-700">{blog.id}</td>
                          <td className="px-6 py-4 text-gray-700 font-medium">
                            {blog.title}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded">
                              {blog.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {blog.date}
                          </td>
                          <td className="px-6 py-4 flex gap-2">
                            <button
                              onClick={() => handleEditBlog(blog)}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md inline-flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md inline-flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Blogs Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-gray-900 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="bg-gray-800 px-4 py-2">
                      <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded">
                        {blog.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-white text-lg font-bold mb-3">
                        {blog.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {blog.description}
                      </p>
                      <div className="flex items-center justify-between text-gray-500 text-xs">
                        <span>{blog.date}</span>
                        <span>{blog.readTime} read</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Edit Modal */}
          {editProjectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedProject ? "Edit Project" : "Add New Project"}
                  </h3>
                  <button
                    onClick={() => setEditProjectModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={projectFormData.title}
                      onChange={(e) =>
                        setProjectFormData({
                          ...projectFormData,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Project title"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Project Description
                    </label>
                    <textarea
                      value={projectFormData.description}
                      onChange={(e) =>
                        setProjectFormData({
                          ...projectFormData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Describe your project"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      value={projectFormData.githubUrl}
                      onChange={(e) =>
                        setProjectFormData({
                          ...projectFormData,
                          githubUrl: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Live URL
                    </label>
                    <input
                      type="text"
                      value={projectFormData.liveUrl}
                      onChange={(e) =>
                        setProjectFormData({
                          ...projectFormData,
                          liveUrl: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Project Image URL
                    </label>
                    <input
                      type="text"
                      value={projectFormData.imageUrl}
                      onChange={(e) =>
                        setProjectFormData({
                          ...projectFormData,
                          imageUrl: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleSaveProject}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditProjectModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Info Edit Modal */}
          {editAdminModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Edit Profile
                  </h3>
                  <button
                    onClick={() => setEditAdminModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={adminFormData.name}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      About
                    </label>
                    <textarea
                      value={adminFormData.about}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          about: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Tell something about yourself"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Skills
                    </label>
                    <input
                      type="text"
                      value={adminFormData.skills}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          skills: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="React, Node.js, ..."
                    />
                  </div>

                  <hr className="my-4" />

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      value={adminFormData.github}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          github: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      value={adminFormData.linkedin}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          linkedin: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Twitter URL
                    </label>
                    <input
                      type="text"
                      value={adminFormData.twitter}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          twitter: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email
                    </label>
                    <input
                      type="text"
                      value={adminFormData.email}
                      onChange={(e) =>
                        setAdminFormData({
                          ...adminFormData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="mailto:your@email.com"
                    />
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleSaveAdmin}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditAdminModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPanel;
