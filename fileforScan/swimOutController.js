const SwimOutStudentModel = require('../models/swimOutModel');

// Create SwimOutStudent entry
// const createSwimOutStudent = async (req, res) => {
//   try {
//     const { inst_ID, std_ID, outTime, date } = req.body;
//     const newSwimOut = new SwimOutStudentModel({ inst_ID, std_ID, outTime, date });
//     const savedSwimOut = await newSwimOut.save();
//     console.log("savedOutSwim",savedSwimOut)
//     res.json(savedSwimOut);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const createSwimOutStudent = (req, res) => {

  const { inst_ID, std_ID, outTime, date } = req.body;

const newSwimOut = new SwimOutStudentModel({inst_ID, std_ID, outTime, date});

console.log("newSwimOut",newSwimOut)

newSwimOut
  .save()
  .then((SwimIn) => res.json(SwimOut))
  .catch((err) => res.json({ error: err.message }));
};


// Get SwimOutStudent by std_ID
const getSwimOutStudentByStdID = async (req, res) => {
  try {
    const { std_ID } = req.params;
    const swimOut = await SwimOutStudentModel.findOne({ std_ID });
    if (!swimOut) return res.status(404).json({ error: "Student not found" });
    res.json(swimOut);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update SwimOutStudent by std_ID
const updateSwimOutStudentByStdID = async (req, res) => {
  try {
    const { std_ID } = req.params;
    const { outTime, date } = req.body;
    const updatedSwimOut = await SwimOutStudentModel.findOneAndUpdate(
      { std_ID },
      { outTime, date },
      { new: true }
    );
    if (!updatedSwimOut) return res.status(404).json({ error: "Student not found" });
    res.json(updatedSwimOut);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get SwimOutStudent by std_ID and date
const getSwimOutStudentByStdIDAndDate = async (req, res) => {
  try {
    const { std_ID, date } = req.params;
    const swimOut = await SwimOutStudentModel.findOne({ std_ID, date });
    if (!swimOut) return res.status(404).json({ error: "Student not found for this date" });
    res.json(swimOut);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSwimOutStudent,
  getSwimOutStudentByStdID,
  updateSwimOutStudentByStdID,
  getSwimOutStudentByStdIDAndDate
};
