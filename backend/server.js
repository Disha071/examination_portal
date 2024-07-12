const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Mongoose schemas and models
const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobileNumber: String,
  enrollYear: String,
  password: String,
});

const teacherSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobileNumber: String,
  department: String,
  password: String,
});

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean,
});

const examSchema = new mongoose.Schema({
  examType: { type: String, required: true },
  subjectName: { type: String, required: true },
  numQuestions: { type: Number },
  numMcqs: { type: Number },
  numTheory: { type: Number },
  questions: [{
    questionText: String,
    questionType: String,
    options: [String],
    correctAnswer: String,
  }],
  createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Exam = mongoose.model('Exam', examSchema);

// Route to handle student registration
app.post('/api/register/student', async (req, res) => {
  try {
    const { name, email, mobileNumber, enrollYear, password } = req.body;
    const newStudent = new Student({ name, email, mobileNumber, enrollYear, password });
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: 'Failed to register student' });
  }
});

// Route to handle teacher registration
app.post('/api/register/teacher', async (req, res) => {
  try {
    const { name, email, mobileNumber, department, password } = req.body;
    const newTeacher = new Teacher({ name, email, mobileNumber, department, password });
    const savedTeacher = await newTeacher.save();
    res.status(201).json(savedTeacher);
  } catch (error) {
    console.error('Error registering teacher:', error);
    res.status(500).json({ error: 'Failed to register teacher' });
  }
});

// Route to handle exam creation
app.post('/api/createExam', async (req, res) => {
  try {
    const { examType, subjectName, numQuestions, questions } = req.body;
    const newExam = new Exam({ examType, subjectName, numQuestions, questions });
    const savedExam = await newExam.save();
    res.status(201).json(savedExam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// Route to get all exams
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await Exam.find();
    res.status(200).json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Define the login route
app.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    let user;
    if (role === 'Admin') {
      user = await Admin.findOne({ email: username });
      if (user && user.password === password) {
        return res.status(200).json({ message: 'Login successful' });
      } else {
        return res.status(401).json({ message: 'Login failed' });
      }
    } else if (role === 'Teacher') {
      user = await Teacher.findOne({ email: username });
    } else if (role === 'Student') {
      user = await Student.findOne({ email: username });
    }
    if (user && password === user.password) {
      return res.status(200).json({ message: 'Login successful' });
    } else {
      return res.status(401).json({ message: 'Login failed' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
