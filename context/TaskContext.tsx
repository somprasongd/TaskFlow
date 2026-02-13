import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Category, FilterState } from '../types';
import { generateId } from '../utils';

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addCategory: (name: string, color?: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getFilteredTasks: () => Task[];
  getTaskCounts: () => Record<string, number>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Tasks', color: 'bg-gray-500', isDefault: true },
  { id: 'work', name: 'Work', color: 'bg-blue-500', isDefault: false },
  { id: 'personal', name: 'Personal', color: 'bg-purple-500', isDefault: false },
  { id: 'study', name: 'Study', color: 'bg-indigo-500', isDefault: false },
];

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Review Frontend PRD',
    description: 'Go through the TaskFlow PRD and note down key requirements for implementation.',
    priority: 'high',
    categoryId: 'work',
    isCompleted: false,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, Eggs, Bread, and Coffee.',
    priority: 'medium',
    categoryId: 'personal',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage or defaults
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('taskflow_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    priority: [],
    categoryId: 'all',
    status: 'all',
    sortBy: 'createdAt',
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_categories', JSON.stringify(categories));
  }, [categories]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (name: string, color: string = 'bg-gray-500') => {
    const newCategory: Category = {
      id: generateId(),
      name,
      color,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    if (DEFAULT_CATEGORIES.find(c => c.id === id)?.isDefault) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    // Reset tasks with this category to undefined or a default? For now, just keep them loosely typed or move to 'General'
    setTasks(prev => prev.map(t => t.categoryId === id ? { ...t, categoryId: undefined } : t));
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];

    // Category Filter
    if (filter.categoryId && filter.categoryId !== 'all') {
      filtered = filtered.filter(t => t.categoryId === filter.categoryId);
    }

    // Search Filter
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description?.toLowerCase().includes(query)
      );
    }

    // Priority Filter
    if (filter.priority.length > 0) {
      filtered = filtered.filter(t => filter.priority.includes(t.priority));
    }

    // Status Filter
    if (filter.status === 'active') {
      filtered = filtered.filter(t => !t.isCompleted);
    } else if (filter.status === 'completed') {
      filtered = filtered.filter(t => t.isCompleted);
    }

    // Sorting
    filtered.sort((a, b) => {
      // Always put completed tasks at the bottom unless filtering by completed specifically (which effectively hides non-completed)
      // If filtering 'all', keeps completed at bottom.
      if (filter.status === 'all' && a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }

      switch (filter.sortBy) {
        case 'priority': {
          const weights = { high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        case 'dueDate': {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  };

  const getTaskCounts = () => {
    const counts: Record<string, number> = {};
    // Initialize all categories with 0
    categories.forEach(c => counts[c.id] = 0);
    // Count total active
    counts['all'] = tasks.filter(t => !t.isCompleted).length;
    
    tasks.forEach(task => {
      if (!task.isCompleted && task.categoryId && counts[task.categoryId] !== undefined) {
        counts[task.categoryId]++;
      }
    });
    return counts;
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      categories,
      filter,
      setFilter,
      addTask,
      updateTask,
      deleteTask,
      addCategory,
      updateCategory,
      deleteCategory,
      getFilteredTasks,
      getTaskCounts,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};