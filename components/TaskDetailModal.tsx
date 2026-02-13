import React from 'react';
import { Task } from '../types';
import { useTasks } from '../context/TaskContext';
import { formatDate, cn, PRIORITY_BG_COLORS, PRIORITY_COLORS } from '../utils';
import { X, Calendar, Tag, Flag, CheckCircle, Trash2, Edit2, Clock, Check } from 'lucide-react';
import Button from './Button';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onEdit: (task: Task) => void;
}

// Helper for dark mode specific priority colors
const PRIORITY_BG_COLORS_DARK = {
  high: 'dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  medium: 'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  low: 'dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, onEdit }) => {
  const { updateTask, deleteTask, categories } = useTasks();

  if (!isOpen || !task) return null;

  const category = categories.find(c => c.id === task.categoryId);

  const handleToggleComplete = () => {
    updateTask(task.id, { isCompleted: !task.isCompleted });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handleEditClick = () => {
    onEdit(task);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] transition-colors duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
             <span className="font-medium">Task Details</span>
             <span>•</span>
             <span className="font-mono text-xs opacity-70">#{task.id.substring(0,6)}</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          
          {/* Title & Status */}
          <div className="flex items-start gap-4 mb-6">
            <button
              onClick={handleToggleComplete}
              className={cn(
                "mt-1 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                task.isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-gray-300 dark:border-gray-600 text-transparent hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Check className="w-5 h-5" strokeWidth={3} />
            </button>
            <div className="flex-1">
               <h2 className={cn(
                 "text-2xl font-bold text-gray-900 dark:text-white leading-tight",
                 task.isCompleted && "line-through text-gray-500 dark:text-gray-500"
               )}>
                 {task.title}
               </h2>
               {task.isCompleted && (
                 <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-1 flex items-center gap-1">
                   <CheckCircle className="w-3.5 h-3.5" />
                   Completed
                 </p>
               )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            {/* Priority */}
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm",
              PRIORITY_BG_COLORS[task.priority],
              PRIORITY_BG_COLORS_DARK[task.priority]
            )}>
              <Flag className={cn("w-4 h-4", task.priority === 'HIGH' ? "fill-current" : "")} />
              <span className="capitalize font-medium">{task.priority} Priority</span>
            </div>

            {/* Category */}
            {category && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 text-sm">
                <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className={cn("w-2 h-2 rounded-full", category.color.replace('bg-', 'bg-').replace('-500', '-500'))} />
                <span className="font-medium">{category.name}</span>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm",
                new Date(task.dueDate) < new Date() && !task.isCompleted
                  ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              )}>
                <Calendar className="w-4 h-4" />
                <span className="font-medium">
                  Due {formatDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Description</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 min-h-[100px]">
              {task.description ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">No description provided.</p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
            </div>
            {task.updatedAt !== task.createdAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated: {new Date(task.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
          <Button variant="danger" onClick={handleDelete} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Task
          </Button>
          <div className="flex gap-3">
             <Button variant="secondary" onClick={onClose}>Close</Button>
             <Button onClick={handleEditClick} className="gap-2">
               <Edit2 className="w-4 h-4" />
               Edit Task
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;