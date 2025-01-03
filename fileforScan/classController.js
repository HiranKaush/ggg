const classModel = require("../models/classModel");

const createClass = async (req, res) => {
  try {
    const {
      inst_ID,
      class_ID,
      grade,
      subject,
      teacherName,
      teacherPhone,
      teacherEmail,
      classFees,
    } = req.body;

    const newClass = new classModel({
      inst_ID,
      class_ID,
      grade,
      subject,
      teacherName,
      teacherPhone,
      teacherEmail,
      classFees,
    });

    const savedClass = await newClass.save();
    res.json(savedClass);
  } catch (err) {
    res.json({ error: err.message });
  }
};

const getAllClasses = (req, res) => {
  classModel
    .find()
    .then((classes) => res.json(classes))
    .catch((err) => res.json({ error: err.message }));
};

const getClassById = (req, res) => {
  const classID = req.params.id;

  classModel
    .findById(classID)
    .then((classs) => {
      if (!classs) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(classs);
    })
    .catch((err) => res.json({ error: err.message }));
};

const updateClass = (req, res) => {
  const classID = req.params.id;
  const {
    inst_ID,
    class_ID,
    grade,
    subject,
    teacherName,
    teacherPhone,
    teacherEmail,
    classFees,
  } = req.body;

  classModel
    .findByIdAndUpdate(
      classID,
      {
        inst_ID,
        class_ID,
        grade,
        subject,
        teacherName,
        teacherPhone,
        teacherEmail,
        classFees,
      },
      { new: true }
    )
    .then((updatedStudent) => {
      if (!updatedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(updatedStudent);
    })
    .catch((err) => res.json({ error: err.message }));
};

const deleteClass = (req, res) => {
  const classID = req.params.id;

  classModel
    .findByIdAndDelete(classID)
    .then((deletedClass) => {
      if (!deletedClass) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json({ message: "Class deleted successfully" });
    })
    .catch((err) => res.json({ error: err.message }));
};

const getClassDetailsByClassID = async (req, res) => {
  const classID = req.params.id;

 

  try {
    const classs = await classModel.findOne({ _id: classID });
   

    if (!classs) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ classs });
  } catch (error) {
    console.error("Error finding class:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllClassesByInsId = async (req, res) => {
  const { id } = req.params;

  try {
    const classes = await classModel
      .find({ inst_ID: id })
      .sort({ createdAt: -1 });

    if (!classes || classes.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No classes found", data: null });
    }

    res.status(200).json({
      success: true,
      message: "classes fetched successfully",
      data: classes,
    });
  } catch (error) {
    

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


// Controller to fetch class details by class_ID
const getClassByClassID = async (req, res) => {
  const { class_ID } = req.params; // Extract class_ID from the route parameters

  try {
    // Fetch the class details from the database
    const classDetails = await classModel.findOne({ class_ID });

    if (!classDetails) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Send the class details as a response
    res.status(200).json({ success: true, data: classDetails });
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  getClassDetailsByClassID,
  getAllClassesByInsId,
  getClassByClassID
};
