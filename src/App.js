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
  Edit, CheckCheck, Info, FileText
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
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDescription, setTaskDescription] = useState('');

  const userRoles = {
    'adib.salama@hightech.edu': 'teacher',
    'siham.htit@hightech.edu': 'team',
    'hicham.alaoui@hightech.edu': 'team',
    'yacir.benmeziane': 'team'
  };

  const initialRoadmapData = {
    'Web Application': {
      Q1: [
        { text: 'Research & Design', completed: false, description: 'Conduct market research and create initial design mockups' },
        { text: 'Azure Architecture', completed: false, description: 'Design cloud architecture using Azure services' },
        { text: 'UI/UX Design', completed: false, description: 'Create user interface and experience designs' }
      ],
      Q2: [
        { text: 'Frontend Development', completed: false, description: 'Build React frontend with modern UI components' },
        { text: 'Backend API', completed: false, description: 'Develop RESTful API using ASP.NET Core' },
        { text: 'Database Setup', completed: false, description: 'Configure Azure SQL Database and Cosmos DB' }
      ],
      Q3: [
        { text: 'Payment Integration', completed: false, description: 'Integrate Stripe/PayPal payment gateway' },
        { text: 'Security Implementation', completed: false, description: 'Add authentication, authorization, and encryption' }
      ],
      Q4: [
        { text: 'Performance Optimization', completed: false, description: 'Optimize load times and database queries' },
        { text: 'Load Testing', completed: false, description: 'Conduct stress testing and performance benchmarking' }
      ]
    },
    'Mobile App': {
      Q1: [{ text: 'Market Research', completed: false, description: 'Analyze mobile app market and competitors' }],
      Q2: [
        { text: 'iOS Development MVP', completed: false, description: 'Build minimum viable product for iOS platform' },
        { text: 'Android Development MVP', completed: false, description: 'Build minimum viable product for Android platform' }
      ],
      Q3: [
        { text: 'Feature Parity', completed: false, description: 'Ensure all features work on both platforms' },
        { text: 'Push Notifications', completed: false, description: 'Implement Firebase Cloud Messaging for notifications' }
      ],
      Q4: [{ text: 'App Store Release', completed: false, description: 'Submit apps to Apple App Store and Google Play Store' }]
    },
    'Admin Dashboard': {
      Q1: [{ text: 'Prototype', completed: false, description: 'Create clickable prototype for admin interface' }],
      Q2: [
        { text: 'User Management', completed: false, description: 'Build user CRUD operations and role management' },
        { text: 'Product Management', completed: false, description: 'Create product catalog management interface' }
      ],
      Q3: [
        { text: 'Analytics Dashboard', completed: false, description: 'Implement charts and data visualization' },
        { text: 'Reporting System', completed: false, description: 'Create automated report generation' }
      ],
      Q4: [{ text: 'Advanced Analytics', completed: false, description: 'Add predictive analytics and insights' }]
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

  const addProduct = () => {
    if (!newProductName.trim()) return;
    
    const updatedData = {
      ...roadmapData,
      [newProductName.trim()]: {
        Q1: [],
        Q2: [],
        Q3: [],
        Q4: []
      }
    };
    
    setRoadmapData(updatedData);
    addActivityLog('Added product', `"${newProductName.trim()}"`);
    setNewProductName('');
    setShowAddProduct(false);
    saveRoadmapData(updatedData, activityLog);
  };

  const startEditProduct = (productName) => {
    setEditingProduct(productName);
    setEditProductName(productName);
  };

  const saveEditProduct = (oldName) => {
    if (!editProductName.trim() || editProductName.trim() === oldName) {
      setEditingProduct(null);
      return;
    }
    
    const updatedData = {};
    Object.keys(roadmapData).forEach(key => {
      if (key === oldName) {
        updatedData[editProductName.trim()] = roadmapData[key];
      } else {
        updatedData[key] = roadmapData[key];
      }
    });
    
    setRoadmapData(updatedData);
    addActivityLog('Renamed product', `"${oldName}" → "${editProductName.trim()}"`);
    setEditingProduct(null);
    setEditProductName('');
    saveRoadmapData(updatedData, activityLog);
  };

  const deleteProduct = (productName) => {
    if (!window.confirm(`Delete "${productName}" and all its tasks?`)) return;
    
    const updatedData = { ...roadmapData };
    delete updatedData[productName];
    
    setRoadmapData(updatedData);
    addActivityLog('Deleted product', `"${productName}"`);
    saveRoadmapData(updatedData, activityLog);
  };

  const addTask = (product, quarter) => {
    if (!newTaskText.trim()) return;
    
    const newTask = { 
      text: newTaskText.trim(), 
      completed: false,
      description: taskDescription.trim() || 'No description provided'
    };
    
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
    setTaskDescription('');
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
    setTaskDescription(roadmapData[product][quarter][index].description || '');
  };

  const saveEditTask = (product, quarter, taskIndex) => {
    if (!editTaskText.trim()) return;
    
    const oldTask = roadmapData[product][quarter][taskIndex];
    const updatedTask = { 
      ...oldTask, 
      text: editTaskText.trim(),
      description: taskDescription.trim() || oldTask.description
    };
    
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
    addActivityLog('Edited task', `"${oldTask.text}" → "${editTaskText.trim()}"`);
    setEditingTask({ product: null, quarter: null, index: null });
    setEditTaskText('');
    setTaskDescription('');
    saveRoadmapData(updatedData, activityLog);
  };

  const cancelEditTask = () => {
    setEditingTask({ product: null, quarter: null, index: null });
    setEditTaskText('');
    setTaskDescription('');
  };

  const openTaskDetails = (product, quarter, taskIndex, task) => {
    setSelectedTask({
      product,
      quarter,
      task,
      index: taskIndex,
      canEdit: userRole === 'team'
    });
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
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
        {selectedTask && (
          <div className="modal-overlay" onClick={closeTaskDetails}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2><FileText size={24} /> Task Details</h2>
                <button onClick={closeTaskDetails} className="modal-close">
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="task-detail-field">
                  <label>Task Name:</label>
                  <p className="task-detail-value">{selectedTask.task.text}</p>
                </div>
                <div className="task-detail-field">
                  <label>Product:</label>
                  <p className="task-detail-value">{selectedTask.product}</p>
                </div>
                <div className="task-detail-field">
                  <label>Quarter:</label>
                  <p className="task-detail-value">{selectedTask.quarter}</p>
                </div>
                <div className="task-detail-field">
                  <label>Status:</label>
                  <p className={`task-detail-status ${selectedTask.task.completed ? 'completed' : 'pending'}`}>
                    {selectedTask.task.completed ? '✓ Completed' : '○ In Progress'}
                  </p>
                </div>
                <div className="task-detail-field">
                  <label>Description:</label>
                  <p className="task-detail-description">{selectedTask.task.description || 'No description provided'}</p>
                </div>
                <div className="task-detail-field">
                  <label>Permissions:</label>
                  <p className="task-detail-permissions">
                    {userRole === 'team' ? (
                      <span className="permission-badge edit">✏️ Editable by Team Members</span>
                    ) : (
                      <span className="permission-badge readonly">👁️ Read-Only (Teacher)</span>
                    )}
                  </p>
                </div>
              </div>
              {selectedTask.canEdit && (
                <div className="modal-footer">
                  <button 
                    onClick={() => {
                      toggleTaskComplete(selectedTask.product, selectedTask.quarter, selectedTask.index);
                      closeTaskDetails();
                    }}
                    className={`btn ${selectedTask.task.completed ? 'btn-warning' : 'btn-success'}`}
                  >
                    {selectedTask.task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </button>
                  <button 
                    onClick={() => {
                      startEditTask(selectedTask.product, selectedTask.quarter, selectedTask.index);
                      closeTaskDetails();
                    }}
                    className="btn btn-primary"
                  >
                    <Edit size={16} /> Edit Task
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="header">
          <div className="header-content">
            <div>
              <h1>Azure E-Commerce Roadmap</h1>
              <p>Collaborative Project Management</p>
            </div>
            <div className="header-actions">
              <span className={`badge ${userRole === 'teacher' ? 'badge-green' : 'badge-blue'}`}>
                {userRole === 'teacher' ? <Eye size={16} /> : <Edit2 size={16} />}
                {userRole === 'teacher' ? 'Teacher (Read-Only)' : 'Team Member (Editor)'}
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
                <div className="header-buttons">
                  {userRole === 'team' && (
                    <>
                      <button
                        onClick={() => setShowAddProduct(true)}
                        className="btn-add-product"
                      >
                        <Plus size={16} /> Add Product
                      </button>
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className={editMode ? 'btn-success' : 'btn-primary'}
                      >
                        {editMode ? <><Save size={16} /> Done</> : <><Edit2 size={16} /> Edit</>}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {showAddProduct && (
                <div className="add-product-form">
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                    placeholder="Product name..."
                    autoFocus
                  />
                  <button onClick={addProduct} className="btn-icon green">
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setShowAddProduct(false);
                      setNewProductName('');
                    }}
                    className="btn-icon red"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
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
                          {editingProduct === product ? (
                            <div className="edit-product-form">
                              <input
                                type="text"
                                value={editProductName}
                                onChange={(e) => setEditProductName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && saveEditProduct(product)}
                                autoFocus
                              />
                              <button onClick={() => saveEditProduct(product)} className="btn-icon-small green">
                                <CheckCircle size={14} />
                              </button>
                              <button onClick={() => setEditingProduct(null)} className="btn-icon-small red">
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="product-header">
                              <span>{product}</span>
                              {editMode && userRole === 'team' && (
                                <div className="product-actions">
                                  <button onClick={() => startEditProduct(product)} className="btn-icon-small blue" title="Edit Product">
                                    <Edit size={14} />
                                  </button>
                                  <button onClick={() => deleteProduct(product)} className="btn-icon-small red" title="Delete Product">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
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
                          )}
                        </td>
                        {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                          <td key={quarter}>
                            <div className="task-list">
                              {quarters[quarter]?.map((task, idx) => (
                                <div key={idx}>
                                  {editingTask.product === product && 
                                   editingTask.quarter === quarter && 
                                   editingTask.index === idx ? (
                                    <div className="edit-task-form-full">
                                      <input
                                        type="text"
                                        value={editTaskText}
                                        onChange={(e) => setEditTaskText(e.target.value)}
                                        placeholder="Task name..."
                                        className="task-input"
                                      />
                                      <textarea
                                        value={taskDescription}
                                        onChange={(e) => setTaskDescription(e.target.value)}
                                        placeholder="Task description..."
                                        className="task-textarea"
                                        rows="2"
                                      />
                                      <div className="edit-task-buttons">
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
                                    </div>
                                  ) : (
                                    <div className={`task ${getQuarterColor(quarter)} ${task.completed ? 'completed' : ''}`}>
                                      <div className="task-content" onClick={() => openTaskDetails(product, quarter, idx, task)}>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (userRole === 'team') {
                                              toggleTaskComplete(product, quarter, idx);
                                            }
                                          }}
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
                                        <Info size={14} className="info-icon" />
                                      </div>
                                      {editMode && userRole === 'team' && (
                                        <div className="task-actions">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              startEditTask(product, quarter, idx);
                                            }}
                                            className="btn-icon-small blue"
                                            title="Edit"
                                          >
                                            <Edit size={14} />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteTask(product, quarter, idx);
                                            }}
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
                                  <div className="add-task-form-full">
                                    <input
                                      type="text"
                                      value={newTaskText}
                                      onChange={(e) => setNewTaskText(e.target.value)}
                                      placeholder="Task name..."
                                      className="task-input"
                                    />
                                    <textarea
                                      value={taskDescription}
                                      onChange={(e) => setTaskDescription(e.target.value)}
                                      placeholder="Task description (optional)..."
                                      className="task-textarea"
                                      rows="2"
                                    />
                                    <div className="add-task-buttons">
                                      <button
                                        onClick={() => addTask(product, quarter)}
                                        className="btn-icon green"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowAddTask({ product: null, quarter: null });
                                          setTaskDescription('');
                                        }}
                                        className="btn-icon red"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
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