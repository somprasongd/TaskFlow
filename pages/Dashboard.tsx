import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import { useTasks } from '../context/TaskContext';
import { Plus, ListTodo, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewingTask, setViewingTask] = useState<Task | undefined>(undefined);
  
  const { tasks: allTasks, getFilteredTasks, filter, categories, reorderTasks, updateTask } = useTasks();
  
  // We use getFilteredTasks to respect search, category, etc.
  const filteredTasks = getFilteredTasks();
  
  // Separate into active and completed for the UI
  const activeTasks = filteredTasks.filter(t => !t.isCompleted);
  const completedTasks = filteredTasks.filter(t => t.isCompleted);

  const isDragEnabled = filter.sortBy === 'manual';

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

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same spot
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Logic to reorder global list based on the filtered view move
    // 1. Find the task being moved
    const sourceList: Task[] = source.droppableId === 'active' ? activeTasks : completedTasks;
    const destList: Task[] = destination.droppableId === 'active' ? activeTasks : completedTasks;
    
    const taskToMove = sourceList[source.index];

    if (!taskToMove) return;
    
    // 2. Identify where it should go in the global list
    // This is tricky with filters. 
    // Simplified robust approach for 'manual' sort:
    // We treat the "allTasks" as the source of truth.
    // We assume that if you drag X to position Y, you want X to be at that position relative to the tasks visible.
    
    // Let's create a new global list.
    const newGlobalTasks: Task[] = [...allTasks];
    const globalSourceIndex = newGlobalTasks.findIndex(t => t.id === taskToMove.id);
    
    // Remove from old position
    if (globalSourceIndex !== -1) {
      newGlobalTasks.splice(globalSourceIndex, 1);
    }
    
    // Update completion status if moved between lists
    const isMovingToCompleted = destination.droppableId === 'completed';
    const isMovingToActive = destination.droppableId === 'active';
    
    let updatedTask = { ...taskToMove };
    if (isMovingToCompleted && !updatedTask.isCompleted) {
      updatedTask.isCompleted = true;
      // We also update the task immediately via context to ensure consistency if reorder fails visually
      updateTask(updatedTask.id, { isCompleted: true });
    } else if (isMovingToActive && updatedTask.isCompleted) {
      updatedTask.isCompleted = false;
      updateTask(updatedTask.id, { isCompleted: false });
    }

    // Find the target insertion index in the global list
    // We look at the destination list in the UI to find the neighbor
    let insertIndex = 0;
    
    if (destList.length === 0) {
       // If destination list is empty, just append to end (or beginning)
       // Simplification: Push to end of global list.
       insertIndex = newGlobalTasks.length;
    } else {
       // If inserting at the end of the destination list
       if (destination.index >= destList.length) {
          // Find the last item of the destination list, get its global index, insert after it
          const lastItem = destList[destList.length - 1];
          if (lastItem) {
            const lastItemIndex = newGlobalTasks.findIndex(t => t.id === lastItem.id);
            insertIndex = lastItemIndex + 1;
          } else {
            insertIndex = newGlobalTasks.length;
          }
       } else {
          // Inserting before an item
          const targetItem = destList[destination.index];
          if (targetItem) {
            const targetItemIndex = newGlobalTasks.findIndex(t => t.id === targetItem.id);
            insertIndex = targetItemIndex;
          }
       }
    }

    newGlobalTasks.splice(insertIndex, 0, updatedTask);
    
    reorderTasks(newGlobalTasks);
  };

  const getPageTitle = () => {
    if (filter.categoryId && filter.categoryId !== 'all') {
      const category = categories.find(c => c.id === filter.categoryId);
      return category ? category.name : 'Tasks';
    }
    return 'All Tasks';
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-200">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You have {activeTasks.length} active tasks
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

            <DragDropContext onDragEnd={onDragEnd}>
              {/* Active Tasks Section */}
              {(filter.status === 'all' || filter.status === 'active') && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Circle className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Active Tasks ({activeTasks.length})
                    </h2>
                  </div>
                  
                  <Droppable droppableId="active" isDropDisabled={!isDragEnabled}>
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="grid gap-3 min-h-[50px]"
                      >
                        {activeTasks.length > 0 ? (
                          activeTasks.map((task, index) => (
                            <Draggable 
                              key={task.id} 
                              draggableId={task.id} 
                              index={index}
                              isDragDisabled={!isDragEnabled}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                  }}
                                >
                                  <TaskCard 
                                    task={task} 
                                    onEdit={handleEditTask}
                                    onClick={handleTaskClick}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                             <p className="text-sm text-gray-500 dark:text-gray-400">No active tasks</p>
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )}

              {/* Completed Tasks Section */}
              {(filter.status === 'all' || filter.status === 'completed') && (
                <div>
                   <div className="flex items-center gap-2 mb-3 px-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Completed Tasks ({completedTasks.length})
                    </h2>
                  </div>

                  <Droppable droppableId="completed" isDropDisabled={!isDragEnabled}>
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="grid gap-3 min-h-[50px]"
                      >
                         {completedTasks.length > 0 ? (
                            completedTasks.map((task, index) => (
                              <Draggable 
                                key={task.id} 
                                draggableId={task.id} 
                                index={index}
                                isDragDisabled={!isDragEnabled}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      opacity: snapshot.isDragging ? 0.8 : 1,
                                    }}
                                  >
                                    <TaskCard 
                                      task={task} 
                                      onEdit={handleEditTask}
                                      onClick={handleTaskClick}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))
                         ) : (
                            <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                               <p className="text-sm text-gray-500 dark:text-gray-400">No completed tasks</p>
                            </div>
                         )}
                         {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )}
            </DragDropContext>
            
            {filteredTasks.length === 0 && (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 transition-colors">
                  <ListTodo className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No tasks found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                   Try adjusting your filters or create a new task.
                </p>
                <button 
                  onClick={handleNewTask}
                  className="mt-6 text-primary font-medium hover:underline"
                >
                  Create new task
                </button>
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