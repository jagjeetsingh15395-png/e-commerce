import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogCard = ({ id, category, title, description, date, readTime }) => {
  return (
    <Link to={`/user/blog/${id}`} className="block">
      <div className="bg-gray-900 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        {/* Category Tag */}
        <div className="bg-gray-800 px-4 py-2">
          <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded">
            {category}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col h-full">
          <h3 className="text-white text-lg font-bold mb-3">{title}</h3>
          <p className="text-gray-400 text-sm mb-4 flex-grow">{description}</p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-gray-500 text-xs mb-4">
            <span>{date}</span>
            <span>{readTime} read</span>
          </div>

          {/* Read More Link */}
          <div className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-semibold">
            Read More
            <ArrowRight size={16} className="ml-2" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
