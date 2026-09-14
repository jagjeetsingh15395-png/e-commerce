import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BlogCard from "../components/BlogCard";
import axios from "axios";

// Configure axios to include credentials
const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:6001/api",
});

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/users/blog");
        if (response.data && response.data.blogs) {
          // Map backend data to frontend format
          const mappedPosts = response.data.blogs.map((blog) => ({
            id: blog._id,
            category: blog.category,
            title: blog.title,
            description: blog.shortDescription,
            date: new Date(blog.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            readTime: "5 min", // Default read time, can be customized per blog later
          }));
          setBlogPosts(mappedPosts);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch blog posts");
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const postsPerPage = 6;
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);
  const startIdx = (currentPage - 1) * postsPerPage;
  const displayedPosts = blogPosts.slice(startIdx, startIdx + postsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            I write about web development, programming, and technologies that I
            learn and build with.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Loading blog posts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : (
            <>
              {blogPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No blog posts found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedPosts.map((post) => (
                    <BlogCard
                      key={post.id}
                      id={post.id}
                      category={post.category}
                      title={post.title}
                      description={post.description}
                      date={post.date}
                      readTime={post.readTime}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {blogPosts.length > 0 && !loading && !error && (
            <div className="flex items-center justify-center gap-2 mt-16">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              {totalPages > 5 && <span className="text-gray-500">...</span>}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
