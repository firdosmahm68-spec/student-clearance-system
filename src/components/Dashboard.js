import React from 'react';
import StudentDashboard from './StudentDashboard';
import OfficeDashboard from './OfficeDashboard';
import AdminDashboard from './AdminDashboard';
import { logout } from '../utils/auth';

const Dashboard = ({ user, setUser }) => {
  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      default:
        return <OfficeDashboard user={user} />;
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      'student': 'Student',
      'admin': 'Administrator',
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
    return roleMap[role] || role;
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand text-black mb-0 h1">Student Clearance System</span>
          <div className="navbar-nav ms-auto">
            <div className="d-flex align-items-center">
              <span className="navbar-text text-black me-3">
                Welcome, <strong>{user.name || user.username}</strong> ({getRoleDisplayName(user.role)})
              </span>
              <button 
                className="btn btn-outline-light text-black btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;