import React, { useState } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ size: [] }],

    ["bold", "italic", "underline", "strike"],

    [{ color: [] }, { background: [] }],

    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],

    ["blockquote", "code-block"],

    ["link", "image"],

    [{ align: [] }],

    ["clean"],
  ],
};

const BlogEditPage = ({ blog, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    blog || {
      category: '',
      title: '',
      description: '',
      content: '',
      readTime: ''
    }
  );

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in title and description');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft size={20} /> Back to Admin
          </button>
          <h1 className="text-4xl font-bold text-gray-900">
            {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-gray-600 mt-2">
            Share your knowledge and insights with the community
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., JavaScript, React, Node.js, MongoDB, Web Dev"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Blog Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter an engaging blog title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Short Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Brief description that will appear in blog cards"
                  rows="3"
                />
              </div>

              {/* Content - Rich Text Editor */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Blog Content</label>
                <div className="bg-white rounded-lg">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => handleChange('content', content)}
                    modules={modules}
                    placeholder="Write your blog content here..."
                  />
                </div>
              </div>

              

              {/* Preview */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="space-y-3">
                  <div>
                    <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded">
                      {formData.category || 'Category'}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{formData.title || 'Blog Title'}</h4>
                  <p className="text-gray-600">{formData.description || 'Blog description will appear here'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>{formData.readTime || '0 min'} read</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {blog ? 'Update Blog' : 'Publish Blog'}
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditPage;
