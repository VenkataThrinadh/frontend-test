import React, { useEffect, useState } from 'react';
import Login from './Login';
import Register from './Register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', or 'dashboard'
  const [editingId, setEditingId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const API = process.env.REACT_APP_API;

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      setUser(JSON.parse(userData));
      fetchCustomers(token);
    }
  }, []);

  // Fetch customers
  const fetchCustomers = (token) => {
    const fetchToken = token || localStorage.getItem('token');
    fetch(`${API}/customers`, {
      headers: {
        'Authorization': `Bearer ${fetchToken}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data) setCustomers(data);
      })
      .catch(err => console.error('Fetch error:', err));
  };

  // Add customer
  const addCustomer = () => {
    if (!name || !email) {
      alert('Please fill in all fields');
      return;
    }
    
    fetch(`${API}/add-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name, email })
    })
      .then(res => res.text())
      .then(() => {
        setName('');
        setEmail('');
        fetchCustomers();
      })
      .catch(err => console.error('Add customer error:', err));
  };

  // Delete customer
  const deleteCustomer = (id) => {
    fetch(`${API}/delete-customer/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(() => fetchCustomers())
      .catch(err => console.error('Delete error:', err));
  };

  // Update customer
  const updateCustomer = () => {
    fetch(`${API}/update-customer/${editingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name, email })
    })
      .then(() => {
        setEditingId(null);
        setName('');
        setEmail('');
        fetchCustomers();
      })
      .catch(err => console.error('Update error:', err));
  };

  const handleLoginSuccess = () => {
    setCurrentView('dashboard');
    setIsAuthenticated(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCustomers();
  };

  const handleRegisterSuccess = () => {
    setCurrentView('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentView('login');
    setCustomers([]);
    setUser(null);
    setName('');
    setEmail('');
    setEditingId(null);
  };

  // Show Login
  if (currentView === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setCurrentView('register')} />;
  }

  // Show Register
  if (currentView === 'register') {
    return <Register onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setCurrentView('login')} />;
  }

  // Show Dashboard
  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* Header */}
      <div style={styles.header}>
        <h1>CRM Dashboard 📊</h1>
        <div style={styles.userInfo}>
          <span>Welcome, <strong>{user?.name}</strong></span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Form */}
      <div style={styles.formContainer}>
        <h2>Manage Customers</h2>
        <div style={styles.form}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <button 
            onClick={editingId ? updateCustomer : addCustomer}
            style={editingId ? styles.updateBtn : styles.addBtn}
          >
            {editingId ? 'Update Customer' : 'Add Customer'}
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div style={styles.listContainer}>
        <h2>Customer List</h2>
        {customers.length === 0 ? (
          <p style={styles.noData}>No customers found</p>
        ) : (
          <ul style={styles.list}>
            {customers.map((c) => (
              <li key={c.id} style={styles.listItem}>
                <div style={styles.customerInfo}>
                  <strong>{c.name}</strong> - {c.email}
                </div>
                <div style={styles.actions}>
                  <button 
                    onClick={() => {
                      setEditingId(c.id);
                      setName(c.name);
                      setEmail(c.email);
                    }}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteCustomer(c.id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  userInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#ff5252',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  form: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    flex: '1',
    minWidth: '150px',
    fontFamily: 'inherit'
  },
  addBtn: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  updateBtn: {
    padding: '10px 20px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  listContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #eee',
    gap: '15px'
  },
  customerInfo: {
    flex: 1
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  editBtn: {
    padding: '8px 12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '8px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: '20px'
  }
};

export default App;