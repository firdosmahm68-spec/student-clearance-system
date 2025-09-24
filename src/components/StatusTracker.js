import React from 'react';

const StatusTracker = ({ request }) => {
  const offices = [
    'departmentHead', 'dormitory', 'cafeteria', 'library',
    'bookStore', 'studentPolice', 'costSharing', 'deepCoordinator', 'studentDean'
  ];

  const officeNames = {
    departmentHead: 'Department Head',
    dormitory: 'Dormitory',
    cafeteria: 'Cafeteria',
    library: 'Library',
    bookStore: 'Book Store',
    studentPolice: 'Student Police',
    costSharing: 'Cost Sharing Office',
    deepCoordinator: 'DEEP Coordinator',
    studentDean: 'Student Dean'
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
    <div>
      <h6 className="mb-3">Office Approvals</h6>
      <div className="row">
        {offices.map(office => (
          <div key={office} className="col-md-6 col-lg-4 mb-3">
            <div className={`card office-card h-100 ${request[office].status === 'approved' ? 'border-success' : 
                             request[office].status === 'rejected' ? 'border-danger' : ''}`}>
              <div className="card-body p-3">
                <h6 className="card-title d-flex justify-content-between align-items-center">
                  {officeNames[office]}
                  {getStatusBadge(request[office].status)}
                </h6>
                
                {request[office].comment && (
                  <p className="card-text mb-2">
                    <small className="text-muted">Comment: {request[office].comment}</small>
                  </p>
                )}
                
                {request[office].date && (
                  <p className="card-text mb-0">
                    <small className="text-muted">
                      Date: {new Date(request[office].date).toLocaleDateString()}
                    </small>
                  </p>
                )}
                
                {!request[office].date && request[office].status === 'pending' && (
                  <p className="card-text mb-0">
                    <small className="text-muted">Waiting for approval</small>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusTracker;