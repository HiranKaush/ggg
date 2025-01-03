const SwimInStudentModel = require('../models/swimInModel');

// const createSwimInStudent = async (req, res) => {
//   try {
//     const { inst_ID, std_ID, inTime, date } = req.body;

//     console.log("object", inst_ID, std_ID, inTime, date);

//     // Check if an entry with the same std_ID and date already exists
//     const existingEntry = await SwimInStudentModel.findOne({ std_ID, date });
//     if (existingEntry) {
//       return res.status(400).json({ error: "Attendance already recorded for this student on the given date." });
//     }

//     // Create new SwimInStudent object
//     const newSwimInStudent = new SwimInStudentModel({
//       inst_ID,
//       std_ID,
//       inTime,
//       date
//     });

//     // Save the new entry
//     const savedSwimInStudent = await newSwimInStudent.save();
//     res.status(201).json(savedSwimInStudent);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



const createSwimInStudent = (req, res) => {

    const { inst_ID, std_ID, inTime, date } = req.body;

  const newSwimIn = new SwimInStudentModel({inst_ID, std_ID, inTime, date});

  console.log("newSwimin",newSwimIn)

  newSwimIn
    .save()
    .then((SwimIn) => res.json(SwimIn))
    .catch((err) => res.json({ error: err.message }));
};


const getSwimInStudentByStdID = async (req, res) => {
    try {
      const { std_ID } = req.params;
  
      const swimInStudent = await SwimInStudentModel.findOne({ std_ID });
      if (!swimInStudent) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      res.json(swimInStudent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const updateSwimInStudentByStdID = async (req, res) => {
    try {
      const { std_ID } = req.params;
      const { inst_ID, inTime, date } = req.body;
  
      const updatedSwimInStudent = await SwimInStudentModel.findOneAndUpdate(
        { std_ID },
        { inst_ID, inTime, date },
        { new: true }
      );
  
      if (!updatedSwimInStudent) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      res.json(updatedSwimInStudent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const getSwimInStudentByStdIDAndDate = async (req, res) => {
    try {
      const { std_ID, date } = req.params;
  
      const swimInStudent = await SwimInStudentModel.findOne({ std_ID, date });
      if (!swimInStudent) {
        return res.status(404).json({ error: "Record not found" });
      }
  
      res.json(swimInStudent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  module.exports = {
    createSwimInStudent,
    getSwimInStudentByStdID,
    updateSwimInStudentByStdID,
    getSwimInStudentByStdIDAndDate
  };
  