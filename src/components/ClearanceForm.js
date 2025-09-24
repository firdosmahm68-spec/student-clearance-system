import React, { useState } from 'react';
import { createClearanceRequest } from '../services/api';

const ClearanceForm = ({ onSubmit, onCancel, user }) => {
  const [formData, setFormData] = useState({
    reason: '',
    year: user.year || '',
    semester: user.semester || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const clearanceReasons = [
    'End of Academic Year',
    'Forced Withdrawal',
    'Disciplinary Case',
    'Academic Dismissal',
    'Graduation',
    'Withdrawal due to Health / Family Problem',
    'ID Replacement'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.reason.trim()) {
      setError('Please select a reason for clearance');
      return;
    }
    
    if (!formData.year) {
      setError('Please select a year');
      return;
    }
    
    if (!formData.semester) {
      setError('Please select a semester');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await createClearanceRequest(formData);
      onSubmit();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-lg border-0">
      <div className="card-header bg-gradient-primary text-white py-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-file-earmark-text me-3 fs-2"></i>
          <div>
            <h5 className="mb-0 text-black-50 ">New Clearance Request</h5>
            <small  style={{ color: "#000" }}>Complete all fields to submit your clearance request</small>
          </div>
        </div>
      </div>
      <div className="card-body p-4 ">
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
            <div className="fw-medium">{error}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
          <div className="row">
            <div className="col-md-6 mb-4">
              <label htmlFor="year" className="form-label fw-semibold text-dark">
                <i className="bi bi-calendar2-range me-2 text-primary"></i>Academic Year *
              </label>
              <select 
                className="form-select form-select-lg border-2 py-3"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Academic Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
                <option value="5">Fifth Year</option>
              </select>
              <div className="form-text text-muted">Select your current academic year</div>
            </div>
            
            <div className="col-md-6 mb-4">
              <label htmlFor="semester" className="form-label fw-semibold text-dark">
                <i className="bi bi-list-ol me-2 text-primary"></i>Semester *
              </label>
              <select 
                className="form-select form-select-lg border-2 py-3"
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
              <div className="form-text text-muted">Select your current semester</div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="reason" className="form-label fw-semibold text-dark">
              <i className="bi bi-chat-square-text me-2 text-primary"></i>Reason for Clearance *
            </label>
            <select
              className="form-select form-select-lg border-2 py-3"
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select a reason for clearance</option>
              {clearanceReasons.map((reason, index) => (
                <option key={index} value={reason} className="fw-medium">{reason}</option>
              ))}
            </select>
            <div className="form-text text-muted">Please select the most appropriate reason for your clearance request</div>
          </div>

          <div className="d-flex gap-3 mt-4 pt-3 border-top">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg flex-grow-1 py-3 fw-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing Request...
                </>
              ) : (
                <>
                  <i className="bi bi-send-check me-2"></i>
                  Submit Clearance Request
                </>
              )}
            </button>
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-lg py-3 fw-medium"
              onClick={onCancel}
              disabled={loading}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClearanceForm;