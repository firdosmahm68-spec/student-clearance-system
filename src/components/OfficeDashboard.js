import React, { useState, useEffect } from 'react';
import { getOfficeRequests, updateRequestStatus, getProcessedOfficeRequests } from '../services/api';

const OfficeDashboard = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decision, setDecision] = useState('approved');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'processed'

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      if (activeTab === 'pending') {
        const response = await getOfficeRequests();
        setRequests(response.data);
      } else {
        const response = await getProcessedOfficeRequests();
        setProcessedRequests(response.data);
      }
    } catch (error) {
      setError('Failed to fetch requests. Please try again.');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeDecision = async (e) => {
    e.preventDefault();
    if (!comment.trim() && decision === 'rejected') {
      setError('Please provide a comment when rejecting a request');
      return;
    }

    setProcessing(true);
    setError('');
    
    try {
      await updateRequestStatus(selectedRequest._id, {
        status: decision,
        comment: comment.trim()
      });
      setSelectedRequest(null);
      setComment('');
      
      // Refresh both tabs after making a decision
      const pendingResponse = await getOfficeRequests();
      setRequests(pendingResponse.data);
      
      const processedResponse = await getProcessedOfficeRequests();
      setProcessedRequests(processedResponse.data);
      
      // Switch to processed tab to see the result
      setActiveTab('processed');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const officeNames = {
    'department_head': 'Department Head',
    'dormitory': 'Dormitory',
    'cafeteria': 'Cafeteria',
    'library': 'Library',
    'book_store': 'Book Store',
    'student_police': 'Student Police',
    'cost_sharing': 'Cost Sharing Office',
    'deep_coordinator': 'DEEP Coordinator',
    'student_dean': 'Student Dean'
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

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1>{officeNames[user.role]} Dashboard</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {selectedRequest ? (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Review Clearance Request</h5>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <h6>Student Information</h6>
                <p><strong>Name:</strong> {selectedRequest.studentId.name}</p>
                <p><strong>ID:</strong> {selectedRequest.studentId.studentId}</p>
                <p><strong>Program:</strong> {selectedRequest.studentId.program}</p>
              </div>
              <div className="col-md-6">
                <h6>Request Details</h6>
                <p><strong>Enrollment:</strong> {selectedRequest.studentId.enrollmentType}</p>
                <p><strong>Year/Semester:</strong> {selectedRequest.year} / {selectedRequest.semester}</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
              </div>
            </div>
            
            <form onSubmit={handleMakeDecision}>
              <div className="form-group mb-3">
                <label htmlFor="decision" className="form-label">Decision</label>
                <select 
                  className="form-control" 
                  id="decision"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  disabled={processing}
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div className="form-group mb-4">
                <label htmlFor="comment" className="form-label">
                  Comment {decision === 'rejected' && <span className="text-danger">*</span>}
                </label>
                <textarea 
                  className="form-control" 
                  id="comment"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={processing}
                  placeholder={decision === 'rejected' ? 'Please provide a reason for rejection' : 'Optional comments...'}
                  required={decision === 'rejected'}
                ></textarea>
              </div>
              <div className="d-flex">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : 'Submit Decision'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary ms-2"
                  onClick={() => setSelectedRequest(null)}
                  disabled={processing}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div>
          {/* Tab Navigation */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending Requests
                {requests.length > 0 && <span className="badge bg-danger ms-2">{requests.length}</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'processed' ? 'active' : ''}`}
                onClick={() => setActiveTab('processed')}
              >
                Processed Requests
                {processedRequests.length > 0 && <span className="badge bg-secondary ms-2">{processedRequests.length}</span>}
              </button>
            </li>
          </ul>

          {activeTab === 'pending' ? (
            <div>
              <h2 className="mb-4">Pending Requests</h2>
              {requests.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i className="bi bi-check-circle display-1 text-success mb-3"></i>
                    <h3>No Pending Requests</h3>
                    <p className="text-muted">There are no clearance requests waiting for your approval.</p>
                  </div>
                </div>
              ) : (
                requests.map(request => (
                  <div key={request._id} className="card mb-3">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Request #{request._id.slice(-6).toUpperCase()}</h6>
                      <span className="badge bg-primary">Pending Review</span>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <p><strong>Student:</strong> {request.studentId.name}</p>
                          <p><strong>ID:</strong> {request.studentId.studentId}</p>
                          <p><strong>Program:</strong> {request.studentId.program}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Enrollment:</strong> {request.studentId.enrollmentType}</p>
                          <p><strong>Year/Semester:</strong> {request.year} / {request.semester}</p>
                          <p><strong>Reason:</strong> {request.reason}</p>
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary mt-2"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <i className="bi bi-eye me-2"></i>Review Request
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div>
              <h2 className="mb-4">Processed Requests</h2>
              {processedRequests.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                    <h3>No Processed Requests</h3>
                    <p className="text-muted">You haven't processed any clearance requests yet.</p>
                  </div>
                </div>
              ) : (
                processedRequests.map(request => {
                  const office = mapRoleToOfficeField(user.role);
                  const officeStatus = request[office]?.status || 'pending';
                  
                  return (
                    <div key={request._id} className="card mb-3">
                      <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Request #{request._id.slice(-6).toUpperCase()}</h6>
                        {getStatusBadge(officeStatus)}
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>Student:</strong> {request.studentId.name}</p>
                            <p><strong>ID:</strong> {request.studentId.studentId}</p>
                            <p><strong>Program:</strong> {request.studentId.program}</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>Enrollment:</strong> {request.studentId.enrollmentType}</p>
                            <p><strong>Year/Semester:</strong> {request.year} / {request.semester}</p>
                            <p><strong>Reason:</strong> {request.reason}</p>
                          </div>
                        </div>
                        {request[office]?.comment && (
                          <div className="mt-3">
                            <strong>Your Comment:</strong>
                            <p className="text-muted">{request[office].comment}</p>
                          </div>
                        )}
                        {request[office]?.date && (
                          <div className="mt-2">
                            <strong>Processed Date:</strong>
                            <p className="text-muted">{new Date(request[office].date).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div className="mt-2">
                          <strong>Overall Status:</strong>
                          <p className="text-muted">{request.status.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function (needs to be available in the component)
function mapRoleToOfficeField(role) {
  const roleMap = {
    'department_head': 'departmentHead',
    'dormitory': 'dormitory',
    'cafeteria': 'cafeteria',
    'library': 'library',
    'book_store': 'bookStore',
    'student_police': 'studentPolice',
    'cost_sharing': 'costSharing',
    'deep_coordinator': 'deepCoordinator',
    'student_dean': 'studentDean'
  };
  
  return roleMap[role] || null;
}

export default OfficeDashboard;