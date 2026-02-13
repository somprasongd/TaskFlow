import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../services/client';
import { Category, FilterState, Task } from '../types';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (newTasks: Task[]) => Promise<void>;
  addCategory: (name: string, color?: string) => Promise<string>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getFilteredTasks: () => Task[]; // This will return current state
  getTaskCounts: () => Record<string, number>;
  refreshData: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    priority: [],
    categoryId: 'all',
    status: 'all',
    sortBy: 'manual',
  });

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    
    const params = new URLSearchParams();
    if (filter.searchQuery) params.append('search', filter.searchQuery);
    if (filter.priority.length > 0) params.append('priority', filter.priority.join(','));
    if (filter.categoryId && filter.categoryId !== 'all') params.append('categoryId', filter.categoryId);
    if (filter.status) params.append('status', filter.status);
    if (filter.sortBy) params.append('sortBy', filter.sortBy);

    try {
      const data = await apiFetch(`/api/tasks?${params.toString()}`);
      setTasks(data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  }, [isAuthenticated, filter]);

  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiFetch('/api/categories');
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchCategories();
    } else {
      setTasks([]);
      setCategories([]);
    }
  }, [isAuthenticated, fetchTasks, fetchCategories]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => {
    const newTask = await apiFetch('/api/tasks', {
      method: 'POST',
      data: taskData,
    });
    setTasks(prev => [newTask, ...prev]);
    fetchCategories(); // Update counts
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updatedTask = await apiFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      data: updates,
    });
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    
    // If completion status changed, refresh categories for counts
    if (updates.isCompleted !== undefined) {
      fetchCategories();
    }
  };

  const deleteTask = async (id: string) => {
    await apiFetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    setTasks(prev => prev.filter(t => t.id !== id));
    fetchCategories();
  };

  const reorderTasks = async (newTasks: Task[]) => {
    // Optimistic update
    const oldTasks = [...tasks];
    setTasks(newTasks);

    try {
      await apiFetch('/api/tasks/reorder', {
        method: 'PUT',
        data: {
          tasks: newTasks.map((t, index) => ({ id: t.id, sortOrder: index })),
        },
      });
    } catch (error) {
      setTasks(oldTasks);
      console.error('Failed to reorder tasks', error);
    }
  };

  const addCategory = async (name: string, color: string = 'bg-gray-500') => {
    const newCategory = await apiFetch('/api/categories', {
      method: 'POST',
      data: { name, color },
    });
    setCategories(prev => [...prev, newCategory]);
    return newCategory.id;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const updatedCategory = await apiFetch(`/api/categories/${id}`, {
      method: 'PATCH',
      data: updates,
    });
    setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c));
  };

  const deleteCategory = async (id: string) => {
    await apiFetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });
    setCategories(prev => prev.filter(c => c.id !== id));
    fetchTasks(); // Tasks might have become uncategorized
  };

  const getFilteredTasks = () => {
    // Since we fetch filtered tasks from backend, we just return current tasks.
    // However, if the UI expects us to filter in-memory (e.g. for immediate search feedback),
    // we could do it here. For now, let's just return tasks.
    return tasks;
  };

  const getTaskCounts = () => {
    const counts: Record<string, number> = {};
    let totalActive = 0;
    
    categories.forEach(c => {
      // @ts-ignore - taskCount is added by backend
      counts[c.id] = c.taskCount || 0;
      totalActive += (c as any).taskCount || 0;
    });
    
    counts['all'] = totalActive;
    return counts;
  };

  const refreshData = async () => {
    await Promise.all([fetchTasks(), fetchCategories()]);
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
      reorderTasks,
      addCategory,
      updateCategory,
      deleteCategory,
      getFilteredTasks,
      getTaskCounts,
      refreshData,
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