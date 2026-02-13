import React, { useState, useEffect } from 'react';
import { Task, Priority } from '../types';
import { useTasks } from '../context/TaskContext';
import Button from './Button';
import Input from './Input';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task;
  initialDate?: string; // YYYY-MM-DD
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, editTask, initialDate }) => {
  const { addTask, updateTask, categories, addCategory } = useTasks();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState('all');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens/changes
  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description || '');
        setPriority(editTask.priority);
        setCategoryId(editTask.categoryId || 'all');
        setDueDate(editTask.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : '');
      } else {
        // Reset defaults
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategoryId('all');
        setDueDate(initialDate || '');
      }
      setError('');
    }
  }, [isOpen, editTask, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const taskData = {
      title,
      description,
      priority,
      categoryId: categoryId === 'all' ? undefined : categoryId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      isCompleted: editTask ? editTask.isCompleted : false,
    };

    if (editTask) {
      updateTask(editTask.id, taskData);
    } else {
      addTask(taskData);
    }
    onClose();
  };

  const handleCreateCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'new') {
      const name = prompt("Enter new category name:");
      if (name) {
        addCategory(name);
      }
    } else {
      setCategoryId(e.target.value);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-10 sm:fade-in-25 transition-colors duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {editTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input 
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            error={error}
          />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 p-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-colors"
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <select
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors"
                value={categoryId}
                onChange={handleCreateCategory}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="new" className="text-primary font-medium">+ New Category</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
            <input
              type="date"
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors dark:[color-scheme:dark]"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{editTask ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;