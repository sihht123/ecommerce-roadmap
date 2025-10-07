import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { 
  Lock, Unlock, Users, Eye, Edit2, Plus, 
  Trash2, Save, X, CheckCircle, LogOut, Circle,
  Edit, CheckCheck
} from 'lucide-react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddTask, setShowAddTask] = useState({ product: null, quarter: null });
  const [editingTask, setEditingTask] = useState({ product: null, quarter: null, index: null });
  const [newTaskText, setNewTaskText] = useState('');
  const [editTaskText, setEditTaskText] = useState('');
  const [roadmapData, setRoadmapData] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  const userRoles = {
    'teacher@school.com': 'teacher',
    'adib@school.com': 'team',
    'student1@school.com': 'team',
    'student2@school.com': 'team'
  };

  const initialRoadmapData = {
    'Web Application': {
      Q1: [
        { text: 'Research & Design', completed: true },
        { text: 'Azure Architecture', completed: true },
        { text: 'UI/UX Design', completed: false }
      ],
      Q2: [
        { text: 'Frontend Development', completed: false },
        { text: 'Backend API', completed: false },
        { text: 'Database Setup', completed: false }
      ],
      Q3: [
        { text: 'Payment Integration', completed: false },
        { text: 'Security Implementation', completed: false }
      ],
      Q4: [
        { text: 'Performance Optimization', completed: false },
        { text: 'Load Testing', completed: false }
      ]
    },
    'Mobile App': {
      Q1: [{ text: 'Market Research', completed: true }],
      Q2: [
        { text: 'iOS Development MVP', completed: false },
        { text: 'Android Development MVP', completed: false }
      ],
      Q3: [
        { text: 'Feature Parity', completed: false },
        { text: 'Push Notifications', completed: false }
      ],
      Q4: [{ text: 'App Store Release', completed: false }]
    },
    'Admin Dashboard': {
      Q1: [{ text: 'Prototype', completed: true }],
      Q2: [
        { text: 'User Management', completed: false },
        { text: 'Product Management', completed: false }
      ],
      Q3: [
        { text: 'Analytics Dashboard', completed: false },
        { text: 'Reporting System', completed: false }
      ],
      Q4: [{ text: 'Advanced Analytics', completed: false }]
    },
    'Order Management': {
      Q1: [],
      Q2: [{ text: 'Core System Design', completed: false }],
      Q3: [
        { text: 'Workflow Automation', completed: false },
        { text: 'Inventory Integration', completed: false }
      ],
      Q4: [{ text: 'AI-Powered Forecasting', completed: false }]
    },
    'Payment System': {
      Q1: [],
      Q2: [],
      Q3: [
        { text: 'Payment Gateway', completed: false },
        { text: 'Multi-Currency', completed: false }
      ],
      Q4: [
        { text: 'Fraud Detection', completed: false },
        { text: 'Recurring Billing', completed: false }
      ]
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserRole(userRoles[currentUser.email] || 'viewer');
        loadRoadmapData();
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRoadmapData = async () => {
    try {
      const docRef = doc(db, 'roadmaps', 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setRoadmapData(docSnap.data().data);
        setActivityLog(docSnap.data().activityLog || []);
      } else {
        await setDoc(docRef, {
          data: initialRoadmapData,
          activityLog: []
        });
        setRoadmapData(initialRoadmapData);
      }
    } catch (error) {
      console.error('Error:', error);
      setRoadmapData(initialRoadmapData);
    }
  };

  const saveRoadmapData = async (newData, newActivity) => {
    try {
      await setDoc(doc(db, 'roadmaps', 'main'), {
        data: newData,
        activityLog: newActivity
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addActivityLog = (action, detail) => {
    const newLog = {
      user: user.email.split('@')[0],
      action,
      detail,
      time: 'Just now'
    };
    const updatedLog = [newLog, ...activityLog.slice(0, 19)];
    setActivityLog(updatedLog);
    saveRoadmapData(roadmapData, updatedLog);
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setEditMode(false);
  };

  const addTask = (product, quarter) => {
    if (!newTaskText.trim()) return;
    
    const newTask = { text: newTaskText.trim(), completed: false };
    const updatedData = {
      ...roadmapData,
      [product]: {
        ...roadmapData[product],
        [quarter]: [...roadmapData[product][quarter], newTask]
      }
    };
    
    setRoadmapData(updatedData);
    addActivityLog('Added task', `"${newTaskText}" to ${product} ${quarter}`);
    setNewTaskText('');
    setShowAddTask({ product: null, quarter: null });
    saveRoadmapData(updatedData, activityLog);
  };

  const deleteTask = (product, quarter, taskIndex) => {
    const taskName = roadmapData[product][quarter][taskIndex].text;
    const updatedData = {
      ...roadmapData,
      [product]: {
        ...roadmapData[product],
        [quarter]: roadmapData[product][quarter].filter((_, idx) => idx !== taskIndex)
      }
    };
    
    setRoadmapData(updatedData);
    addActivityLog('Deleted task', `"${taskName}" from ${product} ${quarter}`);
    saveRoadmapData(updatedData, activityLog);
  };

  const toggleTaskComplete = (product, quarter, taskIndex) => {
    const task = roadmapData[product][quarter][taskIndex];
    const updatedTask = { ...task, completed: !task.completed };
    
    const updatedQuarter = [...roadmapData[product][quarter]];
    updatedQuarter[taskIndex] = updatedTask;
    
    const updatedData = {
      ...roadmapData,
      [product]: {
        ...roadmapData[product],
        [quarter]: updatedQuarter
      }
    };
    
    setRoadmapData(updatedData);
    addActivityLog(
      updatedTask.completed ? 'Completed task' : 'Reopened task',
      `"${task.text}" in ${product} ${quarter}`
    );
    saveRoadmapData(updatedData, activityLog);
  };

  const startEditTask = (product, quarter, index) => {
    setEditingTask({ product, quarter, index });
    setEditTaskText(roadmapData[product][quarter][index].text);
  };

  const saveEditTask = (product, quarter, taskIndex) => {
    if (!editTaskText.trim()) return;
    
    const oldText = roadmapData[product][quarter][taskIndex].text;
    const updatedTask = { ...roadmapData[product][quarter][taskIndex], text: editTaskText.trim() };
    
    const updatedQuarter = [...roadmapData[product][quarter]];
    updatedQuarter[taskIndex] = updatedTask;
    
    const updatedData = {
      ...roadmapData,
      [product]: {
        ...roadmapData[product],
        [quarter]: updatedQuarter
      }
    };
    
    setRoadmapData(updatedData);
    addActivityLog('Edited task', `"${oldText}" → "${editTaskText.trim()}"`);
    setEditingTask({ product: null, quarter: null, index: null });
    setEditTaskText('');
    saveRoadmapData(updatedData, activityLog);
  };

  const cancelEditTask = () => {
    setEditingTask({ product: null, quarter: null, index: null });
    setEditTaskText('');
  };

  const calculateProgress = () => {
    let total = 0;
    let completed = 0;
    
    Object.values(roadmapData).forEach(product => {
      Object.values(product).forEach(tasks => {
        tasks.forEach(task => {
          total++;
          if (task.completed) completed++;
        });
      });
    });
    
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const calculateProductProgress = (product) => {
    let total = 0;
    let completed = 0;
    
    Object.values(roadmapData[product]).forEach(tasks => {
      tasks.forEach(task => {
        total++;
        if (task.completed) completed++;
      });
    });
    
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const getQuarterColor = (quarter) => {
    const colors = {
      Q1: 'task-q1',
      Q2: 'task-q2',
      Q3: 'task-q3',
      Q4: 'task-q4'
    };
    return colors[quarter];
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-box">
          <div className="login-header">
            <div className="lock-icon"><Lock size={40} /></div>
            <h1>Project Roadmap</h1>
            <p>Azure E-Commerce Platform</p>
          </div>
          
          <div className="login-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className="input"
            />
            <button onClick={handleLogin} className="btn-primary">
              <Unlock size={20} /> Login
            </button>
          </div>
          
          <div className="demo-box">
            <p><strong>Demo Accounts:</strong></p>
            <p>Teacher: teacher@school.com / teacher123</p>
            <p>Team: adib@school.com / team123</p>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmapData) return <div className="loading"><div className="spinner"></div></div>;

  const totalTasks = Object.values(roadmapData).reduce((acc, product) => 
    acc + Object.values(product).reduce((sum, tasks) => sum + tasks.length, 0), 0
  );

  const completedTasks = Object.values(roadmapData).reduce((acc, product) => 
    acc + Object.values(product).reduce((sum, tasks) => 
      sum + tasks.filter(t => t.completed).length, 0
    ), 0
  );

  const progress = calculateProgress();

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="header-content">
            <div>
              <h1>Azure E-Commerce Roadmap</h1>
              <p>Collaborative Project Management</p>
            </div>
            <div className="header-actions">
              <span className={`badge ${userRole === 'teacher' ? 'badge-green' : 'badge-blue'}`}>
                {userRole === 'teacher' ? <Eye size={16} /> : <Edit2 size={16} />}
                {userRole === 'teacher' ? 'Teacher' : 'Team Member'}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
          
          <div className="stats">
            <div className="stat blue">
              <span>Total Tasks</span>
              <strong>{totalTasks}</strong>
            </div>
            <div className="stat green">
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>
            <div className="stat orange">
              <span>In Progress</span>
              <strong>{totalTasks - completedTasks}</strong>
            </div>
            <div className="stat purple">
              <span>Progress</span>
              <strong>{progress}%</strong>
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{completedTasks} of {totalTasks} tasks completed</span>
          </div>
        </div>

        <div className="main-grid">
          <div className="roadmap-section">
            <div className="card">
              <div className="card-header">
                <h2>Project Roadmap</h2>
                {userRole === 'team' && (
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={editMode ? 'btn-success' : 'btn-primary'}
                  >
                    {editMode ? <><Save size={16} /> Done</> : <><Edit2 size={16} /> Edit</>}
                  </button>
                )}
              </div>
              
              <div className="table-wrapper">
                <table className="roadmap-table">
                  <thead>
                    <tr>
                      <th className="th-product">PRODUCT</th>
                      <th className="th-q1">Q1</th>
                      <th className="th-q2">Q2</th>
                      <th className="th-q3">Q3</th>
                      <th className="th-q4">Q4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(roadmapData).map(([product, quarters]) => (
                      <tr key={product}>
                        <td className="td-product">
                          <div className="product-header">
                            <span>{product}</span>
                            <div className="product-progress">
                              <div className="mini-progress">
                                <div 
                                  className="mini-progress-fill" 
                                  style={{ width: `${calculateProductProgress(product)}%` }}
                                ></div>
                              </div>
                              <span className="progress-percent">{calculateProductProgress(product)}%</span>
                            </div>
                          </div>
                        </td>
                        {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                          <td key={quarter}>
                            <div className="task-list">
                              {quarters[quarter]?.map((task, idx) => (
                                <div key={idx}>
                                  {editingTask.product === product && 
                                   editingTask.quarter === quarter && 
                                   editingTask.index === idx ? (
                                    <div className="edit-task-form">
                                      <input
                                        type="text"
                                        value={editTaskText}
                                        onChange={(e) => setEditTaskText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && saveEditTask(product, quarter, idx)}
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => saveEditTask(product, quarter, idx)}
                                        className="btn-icon green"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                      <button
                                        onClick={cancelEditTask}
                                        className="btn-icon red"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className={`task ${getQuarterColor(quarter)} ${task.completed ? 'completed' : ''}`}>
                                      <div className="task-content">
                                        <button
                                          onClick={() => toggleTaskComplete(product, quarter, idx)}
                                          className="checkbox-btn"
                                          disabled={userRole === 'teacher'}
                                        >
                                          {task.completed ? 
                                            <CheckCheck size={16} className="check-icon" /> : 
                                            <Circle size={16} className="circle-icon" />
                                          }
                                        </button>
                                        <span className={task.completed ? 'completed-text' : ''}>
                                          {task.text}
                                        </span>
                                      </div>
                                      {editMode && userRole === 'team' && (
                                        <div className="task-actions">
                                          <button
                                            onClick={() => startEditTask(product, quarter, idx)}
                                            className="btn-icon-small blue"
                                            title="Edit"
                                          >
                                            <Edit size={14} />
                                          </button>
                                          <button
                                            onClick={() => deleteTask(product, quarter, idx)}
                                            className="btn-icon-small red"
                                            title="Delete"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              {editMode && userRole === 'team' && (
                                showAddTask.product === product && showAddTask.quarter === quarter ? (
                                  <div className="add-task-form">
                                    <input
                                      type="text"
                                      value={newTaskText}
                                      onChange={(e) => setNewTaskText(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && addTask(product, quarter)}
                                      placeholder="Task name..."
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => addTask(product, quarter)}
                                      className="btn-icon green"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      onClick={() => setShowAddTask({ product: null, quarter: null })}
                                      className="btn-icon red"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowAddTask({ product, quarter })}
                                    className="btn-add"
                                  >
                                    <Plus size={14} /> Add Task
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="sidebar">
            <div className="card">
              <h3><Users size={20} /> Activity Log</h3>
              <div className="activity-list">
                {activityLog.slice(0, 10).map((log, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-header">
                      <strong>{log.user}</strong>
                      <span>{log.time}</span>
                    </div>
                    <p>{log.action}</p>
                    {log.detail && <small>{log.detail}</small>}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Team Members</h3>
              <div className="team-list">
                {Object.entries(userRoles).map(([email, role]) => (
                  <div key={email} className="team-member">
                    <div className={`avatar ${role === 'teacher' ? 'green' : 'blue'}`}>
                      {email[0].toUpperCase()}
                    </div>
                    <div>
                      <p><strong>{email.split('@')[0]}</strong></p>
                      <small>{role}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;