const mongoose = require("mongoose");
const Institute = require("../models/instituteModel");

// --------- Create instritute
const createInstritute = async (req, res) => {
  const {
    name,
    email,
    count,
    notification,
    image,
    instPackage,
    packageStatus,
    currentTime,
    expireTime,
    topUpPrice,
    smsPrice,
    stdCardcardStatus,
    subAdminPaymentPortalStatus
  } = req.body;

  let emptyFields = [];

  if (!name) {
    emptyFields.push("Name");
  }
  if (!email) {
    emptyFields.push("Email");
  }
  if (!count) {
    emptyFields.push("Count");
  }
  if (!notification) {
    emptyFields.push("Notification");
  }
  if (!image) {
    emptyFields.push("Image");
  }
  if (!instPackage) {
    emptyFields.push("InstPackage");
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields", emptyFields });
  }

  // add doc to db
  try {
    const user_id = req.user._id;
    const institute = await Institute.create({
      name,
      email,
      count,
      notification,
      uid: user_id,
      image,
      instPackage,
      packageStatus,
      currentTime,
      expireTime,
      topUpPrice,
      smsPrice,
      stdCardcardStatus,
      subAdminPaymentPortalStatus

    });
    res.status(200).json(institute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --------- Get all instritute
const getAllInstitutes = async (req, res) => {
  //const user_id = req.user._id

  try {
    const institutes = await Institute.find().sort({ createdAt: -1 });

    if (!institutes || institutes.length === 0) {
      return res.status(404).json({ message: "No institutes found" });
    }

    res.status(200).json(institutes);
  } catch (error) {
    

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- Get one instritute
const getInstitute = async (req, res) => {
  const { id } = req.params;

  try {
    const institute = await Institute.findById(id);

    if (!institute) {
      return res.status(404).json({ error: "No such institute" });
    }

    res.status(200).json(institute);
  } catch (error) {
    // Log the error for debugging purposes
    

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- update a Institute
const updateInstitute = async (req, res) => {
  const { id } = req.params;

  try {
    const institute = await Institute.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!institute) {
      return res.status(404).json({ error: "No such institute found" });
    }

    res.status(200).json(institute);
  } catch (error) {
    // Log the error for debugging purposes
    

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- delete a Institute
const deleteInstitute = async (req, res) => {
  const { id } = req.params;

  try {
    const institute = await Institute.findOneAndDelete({ _id: id });

    if (!institute) {
      return res.status(404).json({ error: "No such institute found" });
    }

    res.status(200).json({
      message: "institute deleted successfully",
      deletedInstitute: institute,
    });
  } catch (error) {
    // Log the error for debugging purposes
    

    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createInstritute,
  getAllInstitutes,
  getInstitute,
  updateInstitute,
  deleteInstitute,
};
