const mongoose = require('mongoose');

const clearanceRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
     enum: [
      'End of Academic Year',
      'Forced Withdrawal',
      'Disciplinary Case',
      'Academic Dismissal',
      'Graduation',
      'Withdrawal due to Health / Family Problem',
      'ID Replacement'
    ]
  },
  year: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  departmentHead: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    date: Date
  },
  dormitory: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    date: Date
  },
  cafeteria: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    date: Date
  },
  library: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    date: Date
  },
  bookStore: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    date: Date
  },
  studentPolice: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    date: Date
  },
  costSharing: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    date: Date
  },
  deepCoordinator: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    date: Date
  },
  studentDean: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    date: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

clearanceRequestSchema.pre('findOneAndUpdate', function(next) {
  this.setOptions({ runValidators: false });
  next();
});

clearanceRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ClearanceRequest', clearanceRequestSchema);