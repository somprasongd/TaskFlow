import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import CategoryModal from '../components/CategoryModal';
import { useTasks } from '../context/TaskContext';
import { Category } from '../types';
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { cn } from '../utils';

const Categories: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  
  const { categories, deleteCategory, getTaskCounts } = useTasks();
  const taskCounts = getTaskCounts();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    if (category.isDefault) {
      alert("Cannot delete default categories.");
      return;
    }
    
    if (window.confirm(`Delete category "${category.name}"? Tasks will be ungrouped.`)) {
      deleteCategory(category.id);
    }
  };

  const handleNewCategory = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  // Filter out the 'All' category for management view as it is a virtual category
  const manageableCategories = categories.filter(c => c.id !== 'all');

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[960px] mx-auto">
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage your task categories
                </p>
              </div>
              
              <button
                onClick={handleNewCategory}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {manageableCategories.map(category => (
                <div 
                  key={category.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", category.color.replace('bg-', 'bg-').replace('-500', '-100 dark:bg-opacity-20'))}>
                        <div className={cn("w-4 h-4 rounded-full", category.color)} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{taskCounts[category.id]} tasks</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                     <button 
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 dark:text-gray-500 dark:hover:text-primary-300 dark:hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!category.isDefault && (
                        <button 
                          onClick={() => handleDelete(category)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
              ))}
              
              {manageableCategories.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <FolderOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No categories found</p>
                  <button onClick={handleNewCategory} className="text-primary text-sm font-medium mt-1 hover:underline">Create one</button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editCategory={editingCategory}
      />
    </div>
  );
};

export default Categories;