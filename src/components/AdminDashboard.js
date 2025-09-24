import React, { useState, useEffect } from 'react';
import { registerUser, getAllRequests } from '../services/api';

const AdminDashboard = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
    name: '',
    studentId: '',
    program: 'remedial',
    enrollmentType: 'regular',
    year: '',
    semester: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    if (showRequests) {
      fetchAllRequests();
    }
  }, [showRequests]);

  const fetchAllRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await getAllRequests();
      setRequests(response.data);
    } catch (error) {
      setMessage('Failed to fetch requests. Please try again.');
      console.error('Error fetching requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await registerUser(formData);
      setMessage('User registered successfully');
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'student',
        name: '',
        studentId: '',
        program: 'remedial',
        enrollmentType: 'regular',
        year: '',
        semester: '',
        department:'',
        phone: ''
      });
      setShowForm(false);
    } catch (error) {
      setMessage('Error registering user: ' + (error.response?.data?.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  return (
    <div className="container mt-4">
      <h1>Admin Dashboard</h1>
      
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}
      
      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Administrator Actions</h5>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowForm(true);
                    setShowRequests(false);
                  }}
                  disabled={showForm}
                >
                  <i className="bi bi-person-plus me-2"></i>Register New User
                </button>
                <button 
                  className="btn btn-info text-white"
                  onClick={() => {
                    setShowRequests(true);
                    setShowForm(false);
                  }}
                  disabled={showRequests}
                >
                  <i className="bi bi-list-check me-2"></i>View All Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showForm && (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Register New User</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select 
                      className="form-control" 
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="student">Student</option>
                      <option value="department_head">Department Head</option>
                      <option value="dormitory">Dormitory</option>
                      <option value="cafeteria">Cafeteria</option>
                      <option value="library">Library</option>
                      <option value="book_store">Book Store</option>
                      <option value="student_police">Student Police</option>
                      <option value="cost_sharing">Cost Sharing Office</option>
                      <option value="deep_coordinator">DEEP Coordinator</option>
                      <option value="student_dean">Student Dean</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
              
              {formData.role === 'student' && (
                <>
                  <hr />
                  <h6 className="mb-3">Student Information</h6>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="studentId" className="form-label">Student ID</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="studentId"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>
                      {/* // Add department field to the student form section */}
  
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="program" className="form-label">Program</label>
                        <select 
                          className="form-control" 
                          id="program"
                          name="program"
                          value={formData.program}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value="remedial">Remedial</option>
                          <option value="graduate">Graduate</option>
                          <option value="post_graduate">Post Graduate</option>
                          <option value="Undergraduate">Under graduate</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="enrollmentType" className="form-label">Enrollment Type</label>
                        <select 
                          className="form-control" 
                          id="enrollmentType"
                          name="enrollmentType"
                          value={formData.enrollmentType}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value="regular">Regular</option>
                          <option value="extension">Extension</option>
                          <option value="summer">Summer</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="year" className="form-label">Year</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          id="year"
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="semester" className="form-label">Semester</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          id="semester"
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="department" className="form-label">Department </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="phone" className="form-label">Phone</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="d-flex">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering...
                    </>
                  ) : 'Register User'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary ms-2"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showRequests && (
        <div className="card">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">All Clearance Requests</h5>
          </div>
          <div className="card-body">
            {requestsLoading ? (
              <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <p className="text-muted">No clearance requests found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Student</th>
                      <th>Student ID</th>
                      <th>Program</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(request => (
                      <tr key={request._id}>
                        <td>#{request._id.slice(-6).toUpperCase()}</td>
                        <td>{request.studentId.name}</td>
                        <td>{request.studentId.studentId}</td>
                        <td>{request.studentId.program}</td>
                        <td>{request.reason}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;