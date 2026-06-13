import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, User } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useUserStore();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:top-0 md:bottom-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${
              isActive('/') ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home size={24} className={isActive('/') ? 'fill-current' : ''} />
            <span className="text-xs mt-1">首页</span>
          </Link>
          
          <Link
            to="/list"
            className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${
              isActive('/list') ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search size={24} className={isActive('/list') ? 'fill-current' : ''} />
            <span className="text-xs mt-1">发现</span>
          </Link>
          
          <Link
            to="/publish"
            className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${
              isActive('/publish') ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-lg transition-all ${
              isActive('/publish') 
                ? 'bg-primary text-white' 
                : 'bg-gradient-to-r from-primary to-orange-400 text-white hover:scale-105'
            }`}>
              <Plus size={28} />
            </div>
            <span className="text-xs mt-1">发布</span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center px-4 py-2 transition-all ${
              isActive('/profile') ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {currentUser ? (
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className={`w-6 h-6 rounded-full object-cover ${isActive('/profile') ? 'ring-2 ring-primary' : ''}`}
                />
              </div>
            ) : (
              <User size={24} className={isActive('/profile') ? 'fill-current' : ''} />
            )}
            <span className="text-xs mt-1">
              {currentUser ? currentUser.name : '我的'}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
