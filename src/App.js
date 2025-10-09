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
  Trash2, Save, X, CheckCircle, LogOut 
} from 'lucide-react';
import './App.css';

function App() {
  // State management
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddTask, setShowAddTask] = useState({ product: null, quarter: null });
  const [newTaskText, setNewTaskText] = useState('');
  const [roadmapData, setRoadmapData] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  // User roles - Add your team member emails here!
  const userRoles = {
    'teacher@school.com': 'teacher',
    'adib@school.com': 'team',
    'student1@school.com': 'team',
    'student2@school.com': 'team'
  };

  // Initial roadmap data
  const initialRoadmapData = {
    'Web Application': {
      Q1: ['Research & Design', 'Azure Architecture', 'UI/UX Design'],
      Q2: ['Frontend Development', 'Backend API', 'Database Setup'],
      Q3: ['Payment Integration', 'Security Implementation'],
      Q4: ['Performance Optimization', 'Load Testing']
    },
    'Mobile App': {
      Q1: ['Market Research'],
      Q2: ['iOS Development MVP', 'Android Development MVP'],
      Q3: ['Feature Parity', 'Push Notifications'],
      Q4: ['App Store Release']
    },
    'Admin Dashboard': {
      Q1: ['Prototype'],
      Q2: ['User Management', 'Product Management'],
      Q3: ['Analytics Dashboard', 'Reporting System'],
      Q4: ['Advanced Analytics']
    },
    'Order Management': {
      Q1: [],
      Q2: ['Core System Design'],
      Q3: ['Workflow Automation', 'Inventory Integration'],
      Q4: ['AI-Powered Forecasting']
    },
    'Payment System': {
      Q1: [],
      Q2: [],
      Q3: ['Payment Gateway', 'Multi-Currency'],
      Q4: ['Fraud Detection', 'Recurring Billing']
    }
  };

  // Check if user is logged in
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
  }, [loadRoadmapData, userRoles]);

  // Load roadmap from Firebase
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

  // Save roadmap to Firebase
  const saveRoadmapData = async (newData, newActivity) => {
    try {
      await setDoc(doc(db, 'roadmaps', 'main'), {
        data: newData,
        activityLog: newActivity
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save. Please try again.');
    }
  };

  // Add activity log
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

  // Login handler
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    setEditMode(false);
  };

  // Add task
  const addTask = (product, quarter) => {
    if (!newTaskText.trim()) return;
    
    const updatedData = {
      ...roadmapData,
      [product]: {
        ...roadmapData[product],
        [quarter]: [...roadmapData[product][quarter], newTaskText.trim()]
      }
    };
    
    setRoadmapData(updatedData);
    addActivityLog('Added task', `${newTaskText} to ${product} ${quarter}`);
    setNewTaskText('');
    setShowAddTask({ product: null, quarter: null });
    saveRoadmapData(updatedData, activityLog);
  };

  // Delete task
  const deleteTask = (product, quarter, taskIndex) => {
    const taskName = roadmapData[product][quarter][taskIndex];
    const updatedData = {
      ...roadmapData,
      [product]: {
        ...roadmapData[product],
        [quarter]: roadmapData[product][quarter].filter((_, idx) => idx !== taskIndex)
      }
    };
    
    setRoadmapData(updatedData);
    addActivityLog('Deleted task', `${taskName}`);
    saveRoadmapData(updatedData, activityLog);
  };

  // Get quarter color
  const getQuarterColor = (quarter) => {
    const colors = {
      Q1: 'task-q1',
      Q2: 'task-q2',
      Q3: 'task-q3',
      Q4: 'task-q4'
    };
    return colors[quarter];
  };

  // Loading screen
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Login screen
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

  // Calculate stats
  const totalTasks = Object.values(roadmapData).reduce((acc, product) => 
    acc + Object.values(product).reduce((sum, tasks) => sum + tasks.length, 0), 0
  );

  // Main app
  return (
    <div className="app">
      <div className="container">
        {/* Header */}
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
          
          {/* Stats */}
          <div className="stats">
            <div className="stat blue"><span>Tasks</span><strong>{totalTasks}</strong></div>
            <div className="stat purple"><span>Products</span><strong>5</strong></div>
            <div className="stat orange"><span>Team</span><strong>4</strong></div>
            <div className="stat green"><span>Progress</span><strong>60%</strong></div>
          </div>
        </div>

        <div className="main-grid">
          {/* Roadmap */}
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
                        <td className="td-product">{product}</td>
                        {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                          <td key={quarter}>
                            <div className="task-list">
                              {quarters[quarter]?.map((task, idx) => (
                                <div key={idx} className={`task ${getQuarterColor(quarter)}`}>
                                  <span>{task}</span>
                                  {editMode && userRole === 'team' && (
                                    <button
                                      onClick={() => deleteTask(product, quarter, idx)}
                                      className="btn-delete-task"
                                    >
                                      <Trash2 size={14} />
                                    </button>
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
                                    <button onClick={() => addTask(product, quarter)} className="btn-icon green">
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

          {/* Sidebar */}
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