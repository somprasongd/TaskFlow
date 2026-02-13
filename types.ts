
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  categoryId?: string;
  isCompleted: boolean;
  dueDate?: string; // ISO Date string
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface FilterState {
  searchQuery: string;
  priority: Priority[];
  categoryId: string | null;
  status: 'all' | 'active' | 'completed';
  sortBy: 'manual' | 'createdAt' | 'dueDate' | 'priority' | 'alphabetical';
}
