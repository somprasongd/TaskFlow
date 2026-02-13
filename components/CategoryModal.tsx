import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { Category } from '../types';
import Button from './Button';
import Input from './Input';
import { X, Check } from 'lucide-react';
import { cn } from '../utils';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCategory?: Category;
}

const COLORS = [
  'bg-gray-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, editCategory }) => {
  const { addCategory, updateCategory } = useTasks();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editCategory) {
        setName(editCategory.name);
        setSelectedColor(editCategory.color);
      } else {
        setName('');
        setSelectedColor(COLORS[0]);
      }
      setError('');
    }
  }, [isOpen, editCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    
    if (editCategory) {
      updateCategory(editCategory.id, { name: name.trim(), color: selectedColor });
    } else {
      addCategory(name.trim(), selectedColor);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {editCategory ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input 
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Marketing"
            autoFocus
            error={error}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Color Tag</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    color
                  )}
                >
                  {selectedColor === color && (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">
              {editCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;