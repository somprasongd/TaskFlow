import React, { useState } from 'react';
import { Task, Category } from '../types';
import { formatDate, cn, PRIORITY_BG_COLORS, PRIORITY_COLORS } from '../utils';
import { Check, Calendar, MoreVertical, Edit2, Trash2, Tag, Flag } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onClick: (task: Task) => void;
}

// Helper for dark mode specific priority colors
const PRIORITY_BG_COLORS_DARK = {
  high: 'dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  medium: 'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  low: 'dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onClick }) => {
  const { updateTask, deleteTask, categories } = useTasks();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const category = categories.find(c => c.id === task.categoryId);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { isCompleted: !task.isCompleted });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${task.title}"?`)) {
      setIsDeleting(true);
      setTimeout(() => {
        deleteTask(task.id);
      }, 300); // Wait for animation
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
    setShowMenu(false);
  };

  return (
    <div 
      onClick={() => onClick(task)}
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md dark:shadow-gray-900/10 transition-all duration-200 cursor-pointer",
        task.isCompleted && "bg-gray-50/50 dark:bg-gray-800/50 opacity-70",
        isDeleting && "opacity-0 scale-95"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={cn(
            "mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            task.isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 dark:border-gray-600 text-transparent hover:border-primary dark:hover:border-primary"
          )}
        >
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 
              className={cn(
                "text-base font-medium text-gray-900 dark:text-gray-100 transition-all",
                task.isCompleted && "line-through text-gray-500 dark:text-gray-500"
              )}
            >
              {task.title}
            </h3>
            
            {/* Priority Badge */}
            <span className={cn(
              "flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border",
              PRIORITY_BG_COLORS[task.priority],
              PRIORITY_BG_COLORS_DARK[task.priority],
              task.priority === 'high' ? "font-bold" : "font-medium"
            )}>
              <span className={cn("w-2 h-2 rounded-full", PRIORITY_COLORS[task.priority])} />
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
          )}

          {/* Meta Row */}
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            {category && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium">
                <div className={cn("w-1.5 h-1.5 rounded-full", category.color.replace('bg-', 'bg-').replace('-500', '-500'))} />
                <span>{category.name}</span>
              </div>
            )}
            
            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1",
                new Date(task.dueDate) < new Date() && !task.isCompleted ? "text-red-500 dark:text-red-400 font-medium" : ""
              )}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Actions */}
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            onBlur={() => setTimeout(() => setShowMenu(false), 200)}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
              <button 
                onClick={handleEditClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button 
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;