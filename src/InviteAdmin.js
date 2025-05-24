import React, { useState, useEffect } from 'react';

const InviteAdmin = () => {
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: '',
    expires_in_days: 7
  });
  
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roleOptions = [
    { value: 'admin', label: 'Merchandiser' },
    { value: 'PD', label: 'PD' },
    { value: 'sampling', label: 'Sampling Head' },
    { value: 'embroidery', label: 'Embroidery Head' }
  ];

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem('token'); // Adjust based on your auth system
      const response = await fetch('http://localhost:5000/invites', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvites(data.invites);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInviteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createInvite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/create-invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Invite created successfully! Share this link: ${data.invite_url}`);
        setInviteForm({ email: '', role: '', expires_in_days: 7 });
        fetchInvites(); // Refresh the list
      } else {
        setError(data.message || 'Failed to create invite');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const revokeInvite = async (inviteHash) => {
    if (!window.confirm('Are you sure you want to revoke this invite?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/revoke-invite/${inviteHash}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccess('Invite revoked successfully');
        fetchInvites(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to revoke invite');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const copyInviteLink = (inviteHash) => {
    const inviteUrl = `${window.location.origin}/register?invite=${inviteHash}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setSuccess('Invite link copied to clipboard!');
    });
  };

  const getStatusBadge = (invite) => {
    if (invite.is_used) {
      return <span className="badge badge-success">Used</span>;
    }
    if (invite.is_expired) {
      return <span className="badge badge-danger">Expired</span>;
    }
    return <span className="badge badge-primary">Active</span>;
  };

  return (
    <div className="invite-admin">
      <div className="admin-header">
        <h1>Invite Management</h1>
      </div>

      {/* Create Invite Form */}
      <div className="create-invite-section">
        <h2>Create New Invite</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={createInvite} className="invite-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={inviteForm.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={inviteForm.role}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Role</option>
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="expires_in_days">Expires In (Days)</label>
              <input
                type="number"
                id="expires_in_days"
                name="expires_in_days"
                value={inviteForm.expires_in_days}
                onChange={handleInputChange}
                min="1"
                max="365"
                disabled={isLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Invite'}
          </button>
        </form>
      </div>

      {/* Invites List */}
      <div className="invites-list">
        <h2>Existing Invites</h2>
        
        {invites.length === 0 ? (
          <p>No invites found.</p>
        ) : (
          <div className="table-container">
            <table className="invites-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map(invite => (
                  <tr key={invite.id}>
                    <td>{invite.email}</td>
                    <td>{invite.role_name}</td>
                    <td>{getStatusBadge(invite)}</td>
                    <td>{new Date(invite.created_at).toLocaleDateString()}</td>
                    <td>{new Date(invite.expires_at).toLocaleDateString()}</td>
                    <td>{invite.created_by}</td>
                    <td>
                      <div className="action-buttons">
                        {!invite.is_used && !invite.is_expired && (
                          <>
                            <button
                              onClick={() => copyInviteLink(invite.invite_hash)}
                              className="btn btn-sm btn-secondary"
                            >
                              Copy Link
                            </button>
                            <button
                              onClick={() => revokeInvite(invite.invite_hash)}
                              className="btn btn-sm btn-danger"
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .invite-admin {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .admin-header {
          margin-bottom: 30px;
        }

        .admin-header h1 {
          color: #2d3748;
          font-size: 2rem;
          margin: 0;
        }

        .create-invite-section {
          background: #fff;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 30px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .create-invite-section h2 {
          color: #2d3748;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 16px;
        }

        .alert-error {
          background-color: #fed7d7;
          color: #c53030;
          border: 1px solid #fc8181;
        }

        .alert-success {
          background-color: #c6f6d5;
          color: #2f855a;
          border: 1px solid #68d391;
        }

        .invite-form {
          display: flex;
          flex-direction: column;
        }

        .form-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 500;
          margin-bottom: 4px;
          color: #4a5568;
        }

        .form-group input,
        .form-group select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3182ce;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #3182ce;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2c5aa0;
        }

        .btn-secondary {
          background-color: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover {
          background-color: #cbd5e0;
        }

        .btn-danger {
          background-color: #e53e3e;
          color: white;
        }

        .btn-danger:hover {
          background-color: #c53030;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .invites-list {
          background: #fff;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .invites-list h2 {
          color: #2d3748;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .table-container {
          overflow-x: auto;
        }

        .invites-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .invites-table th,
        .invites-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .invites-table th {
          background-color: #f7fafc;
          font-weight: 600;
          color: #4a5568;
        }

        .invites-table tr:hover {
          background-color: #f7fafc;
        }

        .badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .badge-success {
          background-color: #c6f6d5;
          color: #2f855a;
        }

        .badge-danger {
          background-color: #fed7d7;
          color: #c53030;
        }

        .badge-primary {
          background-color: #bee3f8;
          color: #2b6cb0;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .invites-table {
            font-size: 12px;
          }

          .invites-table th,
          .invites-table td {
            padding: 8px;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default InviteAdmin;