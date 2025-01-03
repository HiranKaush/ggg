const TuteModel = require("../models/tuteModel");

const createTute = (req, res) => {
  const { inst_ID, std_ID, name, classID, month, status } = req.body;

  const newTute = new TuteModel({
    inst_ID,
    std_ID,
    name,
    classID,
    month,
    status,
  });

  newTute
    .save()
    .then((tute) => res.json(tute))
    .catch((err) => res.json({ error: err.message }));
};

const getAllTutes = (req, res) => {
  TuteModel.find()
    .then((tute) => res.json(tute))
    .catch((err) => res.json({ error: err.message }));
};

const getTuteStatus = async (req, res) => {
  const { std_ID, classID, month } = req.query;

  try {
    const tute = await TuteModel.findOne({ std_ID, classID, month });

    if (!tute) {
      return res.status(404).json({ status: "not found" });
    }

    return res.json({ status: tute.status });
  } catch (error) {
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createTute, getAllTutes, getTuteStatus };
