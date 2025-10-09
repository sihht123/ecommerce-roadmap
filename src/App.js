import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const RoadmapManager = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Admin Dashboard',
      tasks: {
        Q1: [{ id: 1, status: 'planned', description: 'Setup basic admin interface' }],
        Q2: [
          { id: 2, status: 'planned', description: 'Add user management' },
          { id: 3, status: 'planned', description: 'Implement analytics dashboard' }
        ],
        Q3: [{ id: 4, status: 'planned', description: 'Advanced reporting features' }],
        Q4: [{ id: 5, status: 'planned', description: 'Performance optimization' }]
      }
    },
    {
      id: 2,
      name: 'Payment System',
      tasks: {
        Q1: [],
        Q2: [],
        Q3: [
          { id: 6, status: 'planned', description: 'Integrate payment gateway' },
          { id: 7, status: 'planned', description: 'Setup recurring billing' }
        ],
        Q4: [{ id: 8, status: 'planned', description: 'Add multiple payment methods' }]
      }
    },
    {
      id: 3,
      name: 'Web Application',
      tasks: {
        Q1: [
          { id: 9, status: 'planned', description: 'Design UI/UX' },
          { id: 10, status: 'planned', description: 'Setup React frontend' },
          { id: 11, status: 'planned', description: 'Implement authentication' }
        ],
        Q2: [{ id: 12, status: 'planned', description: 'Build product catalog' }],
        Q3: [{ id: 13, status: 'planned', description: 'Shopping cart functionality' }],
        Q4: [{ id: 14, status: 'planned', description: 'Checkout process' }]
      }
    },
    {
      id: 4,
      name: 'Mobile App',
      tasks: {
        Q1: [{ id: 15, status: 'planned', description: 'Mobile app architecture' }],
        Q2: [
          { id: 16, status: 'planned', description: 'Develop iOS app' },
          { id: 17, status: 'planned', description: 'Develop Android app' }
        ],
        Q3: [
          { id: 18, status: 'planned', description: 'Push notifications' },
          { id: 19, status: 'planned', description: 'Offline mode' }
        ],
        Q4: [{ id: 20, status: 'planned', description: 'App store deployment' }]
      }
    },
    {
      id: 5,
      name: 'Order Management',
      tasks: {
        Q1: [],
        Q2: [{ id: 21, status: 'planned', description: 'Order tracking system' }],
        Q3: [
          { id: 22, status: 'planned', description: 'Inventory management' },
          { id: 23, status: 'planned', description: 'Shipping integration' }
        ],
        Q4: [{ id: 24, status: 'planned', description: 'Returns processing' }]
      }
    }
  ]);

  const [activities] = useState([
    { user: 'siham.htit', action: 'Completed task', detail: '"undefined" in Payment System Q3', time: 'Just now' },
    { user: 'adib.salama', action: 'Completed task', detail: '"undefined" in Order Management Q2', time: 'Just now' },
    { user: 'siham.htit', action: 'Reopened task', detail: '"undefined" in Order Management Q2', time: 'Just now' }
  ]);

  const [members] = useState([
    { name: 'teacher', role: 'Teacher (View Only)', avatar: 'T', color: 'bg-emerald-500' },
    { name: 'adib', role: 'Team', avatar: 'A', color: 'bg-blue-500' },
    { name: 'student1', role: 'Team', avatar: 'S', color: 'bg-blue-500' },
    { name: 'student2', role: 'Team', avatar: 'S', color: 'bg-blue-500' }
  ]);

  // Current user role - change this to 'teacher' to see read-only mode
  //const [teacher, setCurrentUserRole] = useState('team'); // 'team' or 'teacher'

  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  const getTaskColor = (status) => {
    const colors = {
      planned: 'bg-blue-500',
      inProgress: 'bg-purple-500',
      testing: 'bg-orange-500',
      completed: 'bg-pink-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTotalTasks = () => {
    let total = 0;
    products.forEach(product => {
      quarters.forEach(q => {
        total += product.tasks[q]?.length || 0;
      });
    });
    return total;
  };

  const getCompletedTasks = () => {
    let completed = 0;
    products.forEach(product => {
      quarters.forEach(q => {
        completed += product.tasks[q]?.filter(t => t.status === 'completed').length || 0;
      });
    });
    return completed;
  };

  const getInProgressTasks = () => {
    let inProgress = 0;
    products.forEach(product => {
      quarters.forEach(q => {
        inProgress += product.tasks[q]?.filter(t => t.status === 'inProgress' || t.status === 'testing').length || 0;
      });
    });
    return inProgress;
  };

  const addProduct = () => {
    if (newProductName.trim()) {
      const newProduct = {
        id: Date.now(),
        name: newProductName,
        tasks: { Q1: [], Q2: [], Q3: [], Q4: [] }
      };
      setProducts([...products, newProduct]);
      setNewProductName('');
      setIsAddingProduct(false);
    }
  };

  const deleteProduct = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const updateProductName = (productId, newName) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, name: newName } : p
    ));
    setEditingProduct(null);
  };

  const addTask = (productId, quarter) => {
    const newTask = {
      id: Date.now(),
      status: 'planned',
      description: 'New task - click to edit'
    };
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          tasks: {
            ...p.tasks,
            [quarter]: [...(p.tasks[quarter] || []), newTask]
          }
        };
      }
      return p;
    }));
  };

  const deleteTask = (productId, quarter, taskId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          tasks: {
            ...p.tasks,
            [quarter]: p.tasks[quarter].filter(t => t.id !== taskId)
          }
        };
      }
      return p;
    }));
    setSelectedTask(null);
  };

  const updateTask = (productId, quarter, taskId, updates) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          tasks: {
            ...p.tasks,
            [quarter]: p.tasks[quarter].map(t => 
              t.id === taskId ? { ...t, ...updates } : t
            )
          }
        };
      }
      return p;
    }));
  };

  const totalTasks = getTotalTasks();
  const completedTasks = getCompletedTasks();
  const inProgressTasks = getInProgressTasks();
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Azure E-Commerce Roadmap</h1>
            <p className="text-blue-300">Collaborative Project Management</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2">
              <Edit2 size={16} />
              Team Member
            </button>
            <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-2">Total Tasks</div>
            <div className="text-4xl font-bold">{totalTasks}</div>
          </div>
          <div className="bg-emerald-900/30 backdrop-blur rounded-xl p-6">
            <div className="text-sm text-emerald-400 mb-2">Completed</div>
            <div className="text-4xl font-bold">{completedTasks}</div>
          </div>
          <div className="bg-orange-900/30 backdrop-blur rounded-xl p-6">
            <div className="text-sm text-orange-400 mb-2">In Progress</div>
            <div className="text-4xl font-bold">{inProgressTasks}</div>
          </div>
          <div className="bg-purple-900/30 backdrop-blur rounded-xl p-6">
            <div className="text-sm text-purple-400 mb-2">Progress</div>
            <div className="text-4xl font-bold">{progress}%</div>
          </div>
        </div>

        <div className="text-sm text-slate-400 mb-8">
          {completedTasks} of {totalTasks} tasks completed
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Roadmap Section */}
          <div className="col-span-2 bg-slate-800/30 backdrop-blur rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Project Roadmap</h2>
              <button
                onClick={() => setIsAddingProduct(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>

            {isAddingProduct && (
              <div className="mb-4 p-4 bg-slate-700/50 rounded-lg flex gap-2">
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Enter product name"
                  className="flex-1 px-3 py-2 bg-slate-800 rounded border border-slate-600 focus:border-blue-500 outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && addProduct()}
                />
                <button onClick={addProduct} className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded">
                  <Check size={16} />
                </button>
                <button onClick={() => setIsAddingProduct(false)} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-3 font-semibold">PRODUCT</th>
                    {quarters.map(q => (
                      <th key={q} className="text-center p-3 font-semibold w-48">{q}</th>
                    ))}
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-slate-700/50">
                      <td className="p-3">
                        {editingProduct === product.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              defaultValue={product.name}
                              className="px-2 py-1 bg-slate-800 rounded border border-slate-600 text-sm"
                              onBlur={(e) => updateProductName(product.id, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updateProductName(product.id, e.target.value);
                                }
                              }}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.name}</span>
                            <button
                              onClick={() => setEditingProduct(product.id)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        )}
                        <div className="text-xs text-green-400 mt-1">0%</div>
                      </td>
                      {quarters.map(quarter => (
                        <td key={quarter} className="p-3">
                          <div className="space-y-2">
                            {product.tasks[quarter]?.map(task => (
                              <button
                                key={task.id}
                                onClick={() => setSelectedTask({ ...task, productId: product.id, quarter })}
                                className={`w-full h-10 ${getTaskColor(task.status)} rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity`}
                              >
                                <div className="w-4 h-4 rounded-full border-2 border-white"></div>
                              </button>
                            ))}
                            <button
                              onClick={() => addTask(product.id, quarter)}
                              className="w-full h-8 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-500"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                      ))}
                      <td className="p-3">
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Activity Log */}
            <div className="bg-slate-800/30 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Activity Log
              </h3>
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div key={idx} className="border-l-2 border-slate-700 pl-4">
                    <div className="text-sm font-medium text-blue-400">{activity.user}</div>
                    <div className="text-sm">{activity.action}</div>
                    <div className="text-xs text-slate-500">{activity.detail}</div>
                    <div className="text-xs text-slate-600 mt-1">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-slate-800/30 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Team Members</h3>
              <div className="space-y-3">
                {members.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center font-bold`}>
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Task Details</h3>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Description</label>
                <textarea
                  value={selectedTask.description}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 rounded border border-slate-600 focus:border-blue-500 outline-none min-h-24"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-2">Status</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 rounded border border-slate-600 focus:border-blue-500 outline-none"
                >
                  <option value="planned">Planned</option>
                  <option value="inProgress">In Progress</option>
                  <option value="testing">Testing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    updateTask(selectedTask.productId, selectedTask.quarter, selectedTask.id, {
                      description: selectedTask.description,
                      status: selectedTask.status
                    });
                    setSelectedTask(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    deleteTask(selectedTask.productId, selectedTask.quarter, selectedTask.id);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapManager;