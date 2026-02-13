import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import { useTasks } from '../context/TaskContext';
import { Plus, ListTodo } from 'lucide-react';
import { Task } from '../types';

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false); // Edit/Create Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false); // Detail View Modal
  
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewingTask, setViewingTask] = useState<Task | undefined>(undefined);
  
  const { getFilteredTasks, filter, categories } = useTasks();
  const tasks = getFilteredTasks();

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setViewingTask(task);
    setIsDetailOpen(true);
  };

  const handleNewTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const getPageTitle = () => {
    if (filter.categoryId && filter.categoryId !== 'all') {
      const category = categories.find(c => c.id === filter.categoryId);
      return category ? category.name : 'Tasks';
    }
    
    switch (filter.status) {
      case 'active': return 'Active Tasks';
      case 'completed': return 'Completed Tasks';
      default: return 'All Tasks';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-[960px] mx-auto pb-20 sm:pb-0">
            
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {filter.status === 'completed' 
                    ? `You have completed ${tasks.length} tasks`
                    : `You have ${tasks.filter(t => !t.isCompleted).length} active tasks`
                  }
                </p>
              </div>
              
              {/* Desktop Add Button */}
              <button
                onClick={handleNewTask}
                className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>

            {/* Task List */}
            {tasks.length > 0 ? (
              <div className="grid gap-3">
                {tasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onEdit={handleEditTask}
                    onClick={handleTaskClick}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ListTodo className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                  {filter.searchQuery 
                    ? `No results for "${filter.searchQuery}"`
                    : filter.status === 'completed'
                      ? "No completed tasks yet."
                      : "You're all caught up! Create a new task to get started."}
                </p>
                {!filter.searchQuery && filter.status !== 'completed' && (
                  <button 
                    onClick={handleNewTask}
                    className="mt-6 text-primary font-medium hover:underline"
                  >
                    Create your first task
                  </button>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={handleNewTask}
        className="fixed bottom-6 right-6 z-40 sm:hidden w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Create/Edit Modal */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        editTask={editingTask}
      />

      {/* Detail View Modal */}
      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={viewingTask}
        onEdit={handleEditTask}
      />
    </div>
  );
};

export default Dashboard;