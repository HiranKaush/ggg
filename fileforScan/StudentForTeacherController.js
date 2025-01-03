const studentModel = require("../models/StudentForTeacherModel");
const studentIdModel = require("../models/StudentIdModel");

const createStudentForTecher = async (req, res) => {
  try {
    const {
      inst_ID, std_ID, name, email, age, address, phone, classID, attendence,
    } = req.body;

    const existingStudentId = await studentIdModel.findOne({ std_ID, inst_ID });
    if (existingStudentId) {
      return res.status(400).json({ error: "Student ID is already taken" });
    }

    const newStudentId = new studentIdModel({ inst_ID, std_ID });
    await newStudentId.save();

    const newStudent = new studentModel({
      inst_ID, std_ID, name, email, age, address, phone, classID, attendence,
    });

    const savedStudent = await newStudent.save();
    res.json(savedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Function to get all students by classID
const getStudentsByClassID = async (req, res) => {
  try {
    // Extract classID from query or params
    const { classID } = req.params;

    if (!classID) {
      return res.status(400).json({ error: "classID is required" });
    }

    // Find students by classID
    const students = await studentModel.find({ classID });

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this classID" });
    }

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { createStudentForTecher,getStudentsByClassID };
