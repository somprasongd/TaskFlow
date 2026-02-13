import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskModal from '../components/TaskModal';
import TopBar from '../components/TopBar';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types';
import { cn, PRIORITY_COLORS } from '../utils';

const CalendarView: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewingTask, setViewingTask] = useState<Task | undefined>(undefined);
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<string | undefined>(undefined);

  const { tasks, categories } = useTasks();

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setViewingTask(task);
    setIsDetailOpen(true);
  };

  const handleNewTask = (dateStr?: string) => {
    setEditingTask(undefined);
    setSelectedDateForNewTask(dateStr);
    setIsModalOpen(true);
  };

  // Calendar Logic
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(monthStart.getDate() - monthStart.getDay()); // Start from Sunday
  
  const endDate = new Date(monthEnd);
  endDate.setDate(monthEnd.getDate() + (6 - monthEnd.getDay())); // End on Saturday

  const calendarDays = useMemo(() => {
    const days = [];
    let day = new Date(startDate);
    
    while (day <= endDate) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return days;
  }, [currentDate]); // Re-calculate when month changes

  const getTasksForDay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const tDate = new Date(task.dueDate);
      const tYear = tDate.getFullYear();
      const tMonth = String(tDate.getMonth() + 1).padStart(2, '0');
      const tDay = String(tDate.getDate()).padStart(2, '0');
      const tDateStr = `${tYear}-${tMonth}-${tDay}`;
      return tDateStr === dateStr && !task.isCompleted;
    });
  };

  const navPrev = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const navNext = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const navToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="max-w-[1200px] mx-auto w-full h-full flex flex-col">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-primary" />
                Calendar
              </h1>
              
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                <button onClick={navPrev} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={navToday} className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200">
                  Today
                </button>
                <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white min-w-[140px] text-center">
                  {monthName}
                </span>
                <button onClick={navNext} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => handleNewTask()}
                className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex-1 flex flex-col overflow-hidden min-h-[600px] transition-colors duration-200">
              {/* Week Headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {weekDays.map(day => (
                  <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {calendarDays.map((day, idx) => {
                  const dayTasks = getTasksForDay(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dateStr = day.toISOString().split('T')[0];

                  return (
                    <div 
                      key={idx}
                      onClick={() => handleNewTask(dateStr)}
                      className={cn(
                        "min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700 p-2 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 flex flex-col gap-1",
                        !isCurrentMonth && "bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 dark:text-gray-600",
                        isToday && "bg-blue-50/30 dark:bg-blue-900/10"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                          isToday ? "bg-primary text-white" : "text-gray-700 dark:text-gray-300"
                        )}>
                          {day.getDate()}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col gap-1 overflow-hidden mt-1">
                        {dayTasks.map(task => {
                          const catColor = categories.find(c => c.id === task.categoryId)?.color || 'bg-gray-200';
                          return (
                            <div 
                              key={task.id}
                              onClick={(e) => handleTaskClick(e, task)}
                              className="group flex items-center gap-1.5 px-1.5 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all text-xs overflow-hidden cursor-pointer"
                            >
                              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", PRIORITY_COLORS[task.priority])} />
                              <span className="truncate text-gray-700 dark:text-gray-200 font-medium">{task.title}</span>
                            </div>
                          );
                        })}
                        {dayTasks.length > 3 && (
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 pl-2">
                            + {dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        editTask={editingTask}
        initialDate={selectedDateForNewTask}
      />
      
      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={viewingTask}
        onEdit={handleEditTask}
      />
    </div>
  );
};

export default CalendarView;