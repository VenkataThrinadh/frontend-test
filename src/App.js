import React, { useEffect, useState } from 'react';

function App() {
  const [editingId, setEditingId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const API = process.env.REACT_APP_API;

  // Fetch customers
  const fetchCustomers = () => {
    fetch(`${API}/customers`)
      .then(res => res.json())
      .then(data => setCustomers(data));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Add customer
  const addCustomer = () => {
    fetch(`${API}/add-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email })
    })
      .then(res => res.text())
      .then(() => {
        setName('');
        setEmail('');
        fetchCustomers(); // refresh list
      });
  };

  // Delete customer
  const deleteCustomer = (id) => {
    fetch(`${API}/delete-customer/${id}`, {
      method: 'DELETE'
    })
      .then(() => fetchCustomers());
  };

  // Update customer
  const updateCustomer = () => {
    fetch(`${API}/update-customer/${editingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email })
    })
      .then(() => {
        setEditingId(null);
        setName('');
        setEmail('');
        fetchCustomers();
      });
  };
  return (
    <div style={{ padding: '20px' }}>
      <h1>first CI/CD Customer List</h1>

      {/* Form */}
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={editingId ? updateCustomer : addCustomer}>
        {editingId ? 'Update Customer' : 'Add Customer'}
      </button>

        {/* List */}
        <ul>
          {customers.map((c) => (
            <li key={c.id}>
              {c.name} - {c.email}

              <button onClick={() => {
                setEditingId(c.id);
                setName(c.name);
                setEmail(c.email);
              }}>
                Edit
              </button>

              <button onClick={() => deleteCustomer(c.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
    </div>
  );
}

export default App;