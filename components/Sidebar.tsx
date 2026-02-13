import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, CheckSquare, Settings, LogOut, Plus, Edit3, Calendar } from 'lucide-react';
import { cn } from '../utils';
import CategoryModal from './CategoryModal';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, className }) => {
  const { categories, filter, setFilter, getTaskCounts } = useTasks();
  const { logout, user } = useAuth();
  const taskCounts = getTaskCounts();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (id: string) => {
    setFilter({ ...filter, categoryId: id });
    navigate('/');
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }

  // Helper to check if current route matches (simple approximation)
  const isActive = (path: string) => window.location.hash.includes(path);

  return (
    <>
      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
      />

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-primary font-bold text-xl cursor-pointer" onClick={() => handleNavigate('/')}>
            <CheckSquare className="w-6 h-6" />
            <span>TaskFlow</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Main Links */}
          <div className="space-y-1">
            <button 
              onClick={() => handleCategoryClick('all')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                filter.categoryId === 'all' && !isActive('calendar') && !isActive('categories') && !isActive('profile')
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                <span>All Tasks</span>
              </div>
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {taskCounts['all']}
              </span>
            </button>

            <button 
              onClick={() => handleNavigate('/calendar')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive('calendar')
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </div>
            </button>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleNavigate('/categories')}
                  className={cn(
                    "transition-colors p-1 rounded-md hover:bg-gray-100",
                    isActive('categories') ? "text-primary" : "text-gray-400 hover:text-primary"
                  )}
                  title="Manage Categories"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100"
                  title="Add Category"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              {categories.filter(c => c.id !== 'all').map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    filter.categoryId === category.id && !isActive('calendar') && !isActive('categories') && !isActive('profile')
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("w-2 h-2 rounded-full", category.color.replace('bg-', 'bg-').replace('-500', '-500'))} />
                    <span>{category.name}</span>
                  </div>
                  {taskCounts[category.id] > 0 && (
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {taskCounts[category.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div 
            className="flex items-center gap-3 px-2 mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            onClick={() => handleNavigate('/profile')}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {user?.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleNavigate('/profile')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <button 
              onClick={logout}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;