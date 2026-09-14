import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import axios from "axios";

// Configure axios to include credentials
const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:6001/api",
});

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all blogs first
        const allBlogsResponse = await axiosInstance.get("/users/blog");
        if (allBlogsResponse.data && allBlogsResponse.data.blogs) {
          setAllBlogs(allBlogsResponse.data.blogs);
        }

        // Fetch the specific blog by ID
        if (id) {
          const response = await axiosInstance.get(`/users/blog/${id}`);
          if (response.data && response.data.blog) {
            // Map backend data to frontend format
            const mappedBlog = {
              id: response.data.blog._id,
              category: response.data.blog.category,
              title: response.data.blog.title,
              author: "Harsh Mittal", // Default author, can be added to backend later
              date: new Date(response.data.blog.date).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              ),
              readTime: "5 min", // Default read time
              description: response.data.blog.shortDescription,
              content: response.data.blog.content,
            };
            setBlog(mappedBlog);
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch blog post");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Link
            to="/user/blog"
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors mt-4"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The post you are looking for does not exist.
          </p>
          <Link
            to="/user/blog"
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Map all blogs to frontend format for related posts
  const mappedAllBlogs = allBlogs.map((blogItem) => ({
    id: blogItem._id,
    category: blogItem.category,
    title: blogItem.title,
    date: new Date(blogItem.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }));

  const relatedPosts = mappedAllBlogs
    .filter((item) => item.id !== blog.id)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-br from-gray-50 to-blue-50 py-14">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/user/blog")}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Blogs
          </button>

          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white mb-4">
              {blog.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {blog.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8">{blog.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{blog.readTime} read</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-16">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="text-gray-700 leading-8 text-lg prose max-w-none">
              {Array.isArray(blog.content) ? (
                blog.content.map((paragraph, index) => (
                  <p key={`${blog.id}-${index}`} className="mb-4">
                    {paragraph}
                  </p>
                ))
              ) : (
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              )}
            </div>
          </article>

          <section className="max-w-3xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/user/blog/${post.id}`}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-6 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600">{post.date}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BlogDetail;
