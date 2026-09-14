import React from 'react';
import { Link } from 'react-router-dom';

const AdminFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm">&copy; 2024 Admin Panel. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500">Admin Dashboard v1.0</p>
      </div>
    </footer>
  );
};

export default AdminFooter;
