const ClearanceRequest = require('../models/ClearanceRequest');
const User = require('../models/User');

// Create clearance request
exports.createRequest = async (req, res) => {
  try {
    // Only students can create clearance requests
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create clearance requests' });
    }
    
    const existingRequest = await ClearanceRequest.findOne({
      studentId: req.user.id,
      status: { $nin: ['rejected', 'approved'] }
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have an active clearance request' });
    }
    const { reason, year, semester } = req.body;
    
    // Validate required fields
    if (!reason || !year || !semester) {
      return res.status(400).json({ 
        message: 'Reason, year, and semester are required' 
      });
    }

    const clearanceRequest = new ClearanceRequest({
      studentId: req.user.id,
      reason,
      year,
      semester
    });
    
    await clearanceRequest.save();
    
    // Populate student details
    await clearanceRequest.populate('studentId', 'name studentId program enrollmentType year semester');
    
    res.status(201).json(clearanceRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's clearance requests
exports.getStudentRequests = async (req, res) => {
  try {
    // Only students can view their own requests
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const requests = await ClearanceRequest.find({ studentId: req.user.id })
      .populate('studentId', 'name studentId program enrollmentType year semester');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending requests for an office
exports.getOfficeRequests = async (req, res) => {
  try {
    const office = mapRoleToOfficeField(req.user.role);
    
    if (!office) {
      return res.status(403).json({ message: 'No pending requests for your role' });
    }
    
    const query = { [`${office}.status`]: 'pending' };
    
    const requests = await ClearanceRequest.find(query)
      .populate('studentId', 'name studentId program enrollmentType year semester');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update clearance status for an office
exports.updateStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, comment } = req.body;
    const office = mapRoleToOfficeField(req.user.role);
    
    if (!office) {
      return res.status(403).json({ message: 'You cannot update this clearance' });
    }
    
    // Check if the previous office has approved (if not the first one)
    if (office !== 'departmentHead') {
      const request = await ClearanceRequest.findById(requestId);
      const officeOrder = [
        'departmentHead', 'dormitory', 'cafeteria', 'library',
        'bookStore', 'studentPolice', 'costSharing', 'deepCoordinator', 'studentDean'
      ];
      
      const currentOfficeIndex = officeOrder.indexOf(office);
      const previousOffice = officeOrder[currentOfficeIndex - 1];
      
      if (request[previousOffice].status !== 'approved') {
        return res.status(400).json({ 
          message: `Previous office (${previousOffice}) has not approved yet` 
        });
      }
    }
    
    const updateData = {
      [`${office}.status`]: status,
      [`${office}.comment`]: comment,
      [`${office}.date`]: new Date(),
      updatedAt: new Date()
    };
    
    // If rejected, update overall status
    if (status === 'rejected') {
      updateData.status = 'rejected';
    }
    
    const request = await ClearanceRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true , runValidators: false }
    ).populate('studentId', 'name studentId program enrollmentType year semester');
    
    // Check if all offices have approved
    if (status === 'approved') {
      const allApproved = [
        'departmentHead', 'dormitory', 'cafeteria', 'library',
        'bookStore', 'studentPolice', 'costSharing', 'deepCoordinator', 'studentDean'
      ].every(office => request[office].status === 'approved');
      
      if (allApproved) {
        await ClearanceRequest.findByIdAndUpdate(
          requestId,
          { status: 'approved', updatedAt: new Date() },
          { runValidators: false }
        );
        request.status = 'approved';
      }
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get approval count for a request
exports.getApprovalCount = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await ClearanceRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Only the student who owns the request can view it
    if (req.user.role === 'student' && request.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const offices = [
      'departmentHead', 'dormitory', 'cafeteria', 'library',
      'bookStore', 'studentPolice', 'costSharing', 'deepCoordinator', 'studentDean'
    ];
    
    const approvedCount = offices.filter(office => request[office].status === 'approved').length;
    const totalCount = offices.length;
    
    res.json({
      approvedCount,
      totalCount,
      percentage: Math.round((approvedCount / totalCount) * 100)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all requests for admin
exports.getAllRequests = async (req, res) => {
  try {
    // Only admin can view all requests
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const requests = await ClearanceRequest.find()
      .populate('studentId', 'name studentId program enrollmentType year semester');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all requests for an office (both pending and processed)
exports.getAllOfficeRequests = async (req, res) => {
  try {
    const office = mapRoleToOfficeField(req.user.role);
    
    if (!office) {
      return res.status(403).json({ message: 'No requests available for your role' });
    }
    
    // Get requests where this office has processed (approved/rejected) or pending
    const query = { 
      $or: [
        { [`${office}.status`]: 'pending' },
        { [`${office}.status`]: 'approved' },
        { [`${office}.status`]: 'rejected' }
      ]
    };
    
    const requests = await ClearanceRequest.find(query)
      .populate('studentId', 'name studentId program enrollmentType year semester')
      .sort({ updatedAt: -1 }); // Sort by most recent first
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get processed requests for an office (approved/rejected)
exports.getProcessedOfficeRequests = async (req, res) => {
  try {
    const office = mapRoleToOfficeField(req.user.role);
    
    if (!office) {
      return res.status(403).json({ message: 'No processed requests for your role' });
    }
    
    // Get requests where this office has processed (approved/rejected)
    const query = { 
      $or: [
        { [`${office}.status`]: 'approved' },
        { [`${office}.status`]: 'rejected' }
      ]
    };
    
    const requests = await ClearanceRequest.find(query)
      .populate('studentId', 'name studentId program enrollmentType year semester')
      .sort({ updatedAt: -1 }); // Sort by most recent first
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to map user role to clearance request field
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
// Generate clearance certificate
exports.generateCertificate = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await ClearanceRequest.findById(requestId)
      .populate('studentId', 'name studentId program enrollmentType year semester');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if the request is fully approved
    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Clearance request is not fully approved yet' });
    }
    
    // Check if the student owns the request or admin is accessing
    if (req.user.role !== 'admin' && request.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Generate certificate data (in a real app, you might use a PDF generation library)
    const certificateData = {
      studentName: request.studentId.name,
      studentId: request.studentId.studentId,
      program: request.studentId.program,
      year: request.year,
      semester: request.semester,
      requestId: request._id,
      approvalDate: new Date().toLocaleDateString(),
      offices: [
        { name: 'Department Head', status: request.departmentHead.status, date: request.departmentHead.date },
        { name: 'Dormitory', status: request.dormitory.status, date: request.dormitory.date },
        { name: 'Cafeteria', status: request.cafeteria.status, date: request.cafeteria.date },
        { name: 'Library', status: request.library.status, date: request.library.date },
        { name: 'Book Store', status: request.bookStore.status, date: request.bookStore.date },
        { name: 'Student Police', status: request.studentPolice.status, date: request.studentPolice.date },
        { name: 'Cost Sharing Office', status: request.costSharing.status, date: request.costSharing.date },
        { name: 'DEEP Coordinator', status: request.deepCoordinator.status, date: request.deepCoordinator.date },
        { name: 'Student Dean', status: request.studentDean.status, date: request.studentDean.date }
      ]
    };
    
    res.json({
      message: 'Certificate generated successfully',
      certificate: certificateData,
      downloadUrl: `/api/clearance/${requestId}/certificate-pdf` // This would be the endpoint for PDF download
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate PDF certificate (example endpoint)
exports.generateCertificatePDF = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const request = await ClearanceRequest.findById(requestId)
      .populate('studentId', 'name studentId program enrollmentType year semester');
    
    if (!request || request.status !== 'approved') {
      return res.status(400).json({ message: 'Certificate not available' });
    }
    
    // In a real application, you would use a PDF generation library like pdfkit, jspdf, etc.
    // For now, we'll return a JSON response with certificate data
    const certificateData = {
      studentName: request.studentId.name,
      studentId: request.studentId.studentId,
      program: request.studentId.program,
      year: request.year,
      semester: request.semester,
      requestId: request._id,
      approvalDate: new Date().toLocaleDateString(),
      message: 'This student has successfully completed all clearance requirements.'
    };
    
    res.json({
      message: 'PDF certificate would be generated here',
      certificate: certificateData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
