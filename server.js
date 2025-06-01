const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
// MongoDB connection
mongoose.connect('mongodb+srv://mongohub:Cand6&ff001@cluster0.i2feedp.mongodb.net/bioappdatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Student Schema & Model
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sex: { type: String, required: true },
  age: { type: Number, required: true },
  address: String,
  school: String,
  classLevel: String,
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// Batch endpoint to save multiple students
app.post('/api/students/batch', async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Students array is required' });
    }

    // Validate required fields
    for (const student of students) {
      if (!student.name || !student.sex || !student.age) {
        return res.status(400).json({ message: 'Each student must have name, sex, and age' });
      }
    }

    // Insert many students
    const insertedStudents = await Student.insertMany(students);

    res.status(201).json({ message: 'Students saved successfully', count: insertedStudents.length });
  } catch (error) {
    console.error('Error saving students:', error);
    res.status(500).json({ message: 'Server error while saving students' });
  }
});
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get students' });
  }
});
// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json(updatedStudent);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
