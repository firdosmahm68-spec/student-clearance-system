const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  department: String,
  role: {
    type: String,
    required: true,
    enum: ['admin', 'student', 'department_head', 'dormitory', 'cafeteria', 
           'library', 'book_store', 'student_police', 'cost_sharing', 
           'deep_coordinator', 'student_dean']
  },
  // Student-specific fields (only for users with role 'student')
  name: String,
  studentId: String,
  program: {
    type: String,
    enum: ['remedial', 'Undergraduate','graduate', 'post_graduate']
  },
  enrollmentType: {
    type: String,
    enum: ['regular','summer', 'extension']
  },
  year: Number,
  semester: Number,
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
// Add to the student-specific fields section


module.exports = mongoose.model('User', userSchema);