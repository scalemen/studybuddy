import React, { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/MainLayout";
import { Calendar, Clock, Target, Plus, CheckCircle, Circle, Trash2, BarChart3, Timer, Play, Pause, RotateCcw } from 'lucide-react';

interface StudyTask {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
  estimatedTime: number;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  category: string;
}

function StudyTimer() {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(sessionType === 'focus' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Timer className="h-5 w-5" />
        Study Timer
      </h3>
      <div className="text-center">
        <div className="text-4xl font-mono font-bold mb-4 text-blue-600">
          {formatTime(time)}
        </div>
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
              setSessionType('focus');
              setTime(25 * 60);
              setIsRunning(false);
            }}
            className={`px-3 py-1 rounded text-sm ${
              sessionType === 'focus' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Focus (25min)
          </button>
          <button
            onClick={() => {
              setSessionType('break');
              setTime(5 * 60);
              setIsRunning(false);
            }}
            className={`px-3 py-1 rounded text-sm ${
              sessionType === 'break' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Break (5min)
          </button>
        </div>
      </div>
    </div>
  );
}

function StudyPlanner() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [newTask, setNewTask] = useState<Partial<StudyTask>>({});
  const [newGoal, setNewGoal] = useState<Partial<StudyGoal>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const savedTasks = localStorage.getItem('study-tasks');
    const savedGoals = localStorage.getItem('study-goals');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  const saveTasks = (updatedTasks: StudyTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('study-tasks', JSON.stringify(updatedTasks));
  };

  const saveGoals = (updatedGoals: StudyGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem('study-goals', JSON.stringify(updatedGoals));
  };

  const addTask = () => {
    if (!newTask.title || !newTask.subject) return;
    
    const task: StudyTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || '',
      subject: newTask.subject,
      priority: newTask.priority || 'medium',
      dueDate: newTask.dueDate || selectedDate,
      completed: false,
      estimatedTime: newTask.estimatedTime || 60,
    };
    
    saveTasks([...tasks, task]);
    setNewTask({});
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.category) return;
    
    const goal: StudyGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || '',
      targetDate: newGoal.targetDate || '',
      progress: 0,
      category: newGoal.category,
    };
    
    saveGoals([...goals, goal]);
    setNewGoal({});
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, progress } : goal
    );
    saveGoals(updatedGoals);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const todayTasks = tasks.filter(task => task.dueDate === selectedDate);
  const upcomingTasks = tasks.filter(task => task.dueDate > selectedDate);
  const overdueTasks = tasks.filter(task => task.dueDate < selectedDate && !task.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">📚 Study Buddy</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-md px-3 py-2"
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'tasks', name: 'Tasks', icon: '✅' },
            { id: 'goals', name: 'Goals', icon: '🎯' },
            { id: 'analytics', name: 'Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Tasks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
              <div className="space-y-3">
                {todayTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <button onClick={() => toggleTask(task.id)}>
                      {task.completed ? 
                        <CheckCircle className="h-5 w-5 text-green-600" /> : 
                        <Circle className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600">{task.subject}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
                {todayTasks.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No tasks for today</p>
                )}
              </div>
            </div>

            {/* Goals Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
              <div className="space-y-4">
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{goal.title}</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <StudyTimer />
            
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Tasks</span>
                  <span className="font-semibold">{tasks.filter(t => t.completed).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Goals</span>
                  <span className="font-semibold">{goals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overdue Tasks</span>
                  <span className="font-semibold text-red-600">{overdueTasks.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title || ''}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="border rounded-md px-3 py-2"
              />
              <input
                type="text"
                placeholder="Subject"
                value={newTask.subject || ''}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                className="border rounded-md px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select
                value={newTask.priority || 'medium'}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                className="border rounded-md px-3 py-2"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                value={newTask.dueDate || selectedDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="border rounded-md px-3 py-2"
              />
              <input
                type="number"
                placeholder="Time (min)"
                value={newTask.estimatedTime || ''}
                onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) })}
                className="border rounded-md px-3 py-2"
              />
            </div>
            <button
              onClick={addTask}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Today</h3>
              {todayTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg mb-3">
                  <button onClick={() => toggleTask(task.id)}>
                    {task.completed ? 
                      <CheckCircle className="h-5 w-5 text-green-600" /> : 
                      <Circle className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-600">{task.subject}</p>
                  </div>
                  <button onClick={() => deleteTask(task.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-orange-700 mb-4">Upcoming</h3>
              {upcomingTasks.slice(0, 5).map(task => (
                <div key={task.id} className="p-3 border rounded-lg mb-3">
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.subject}</p>
                  <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-red-700 mb-4">Overdue</h3>
              {overdueTasks.map(task => (
                <div key={task.id} className="p-3 border border-red-200 bg-red-50 rounded-lg mb-3">
                  <h4 className="font-medium text-red-900">{task.title}</h4>
                  <p className="text-sm text-red-700">{task.subject}</p>
                  <p className="text-xs text-red-600">Due: {task.dueDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Goal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Goal title"
                value={newGoal.title || ''}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="border rounded-md px-3 py-2"
              />
              <input
                type="text"
                placeholder="Category"
                value={newGoal.category || ''}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="border rounded-md px-3 py-2"
              />
            </div>
            <input
              type="date"
              value={newGoal.targetDate || ''}
              onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              className="border rounded-md px-3 py-2 mb-4 w-full"
            />
            <button
              onClick={addGoal}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Add Goal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map(goal => (
              <div key={goal.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{goal.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{goal.category}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Target: {goal.targetDate}</p>
                  <select
                    value={goal.progress}
                    onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                    className="text-sm border rounded px-2 py-1"
                  >
                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
                      <option key={val} value={val}>{val}%</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round((tasks.filter(t => t.completed).length / Math.max(tasks.length, 1)) * 100)}%
              </div>
              <p className="text-sm text-gray-600">Task Completion</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {goals.length}
              </div>
              <p className="text-sm text-gray-600">Active Goals</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-red-600">
                {overdueTasks.length}
              </div>
              <p className="text-sm text-gray-600">Overdue Tasks</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(tasks.filter(t => t.completed).reduce((acc, t) => acc + (t.estimatedTime || 0), 0) / 60)}h
              </div>
              <p className="text-sm text-gray-600">Study Time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyPlannerPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <StudyPlanner />
      </div>
    </MainLayout>
  );
}