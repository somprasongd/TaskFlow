import React from 'react';
import { Search, Filter, SortAsc, Menu } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { Priority } from '../types';
import { cn } from '../utils';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { filter, setFilter } = useTasks();

  const togglePriority = (p: Priority) => {
    const current = filter.priority;
    const next = current.includes(p)
      ? current.filter(item => item !== p)
      : [...current, p];
    setFilter({ ...filter, priority: next });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 transition-colors duration-200">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-[960px] mx-auto w-full">
        
        {/* Top Row: Menu & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filter.searchQuery}
              onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          
          <div className="flex items-center gap-1.5 border-r border-gray-200 dark:border-gray-700 pr-3 mr-1">
            <button
              onClick={() => togglePriority('high')}
              className={cn(
                "px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                filter.priority.includes('high')
                  ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              High
            </button>
            <button
              onClick={() => togglePriority('medium')}
              className={cn(
                "px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                filter.priority.includes('medium')
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              Medium
            </button>
            <button
              onClick={() => togglePriority('low')}
              className={cn(
                "px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                filter.priority.includes('low')
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              Low
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
              className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
              className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="createdAt">Newest</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>

        </div>
      </div>
    </header>
  );
};

export default TopBar;