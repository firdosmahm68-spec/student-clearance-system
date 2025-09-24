const express = require('express');
const { 
  createRequest, 
  getStudentRequests, 
  getOfficeRequests, 
  updateStatus,
  getApprovalCount,
  getAllRequests,
  getAllOfficeRequests,
  getProcessedOfficeRequests,
  generateCertificate,
  generateCertificatePDF
} = require('../controllers/clearanceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.post('/', auth, roleCheck('student'), createRequest);
router.get('/student', auth, roleCheck('student'), getStudentRequests);
router.get('/office', auth, roleCheck(
  'department_head', 'dormitory', 'cafeteria', 'library', 
  'book_store', 'student_police', 'cost_sharing', 
  'deep_coordinator', 'student_dean'
), getOfficeRequests);
router.patch('/:requestId', auth, roleCheck(
  'department_head', 'dormitory', 'cafeteria', 'library', 
  'book_store', 'student_police', 'cost_sharing', 
  'deep_coordinator', 'student_dean'
), updateStatus);
router.get('/:requestId/approval-count', auth, getApprovalCount);
router.get('/all', auth, roleCheck('admin'), getAllRequests);
router.get('/office/all', auth, roleCheck(
  'department_head', 'dormitory', 'cafeteria', 'library', 
  'book_store', 'student_police', 'cost_sharing', 
  'deep_coordinator', 'student_dean'
), getAllOfficeRequests);
router.get('/office/processed', auth, roleCheck(
  'department_head', 'dormitory', 'cafeteria', 'library', 
  'book_store', 'student_police', 'cost_sharing', 
  'deep_coordinator', 'student_dean'
), getProcessedOfficeRequests);
// Add these routes to your existing clearance routes
router.get('/:requestId/certificate', auth, generateCertificate);
router.get('/:requestId/certificate-pdf', auth, generateCertificatePDF);
module.exports = router;