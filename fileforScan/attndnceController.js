const AttendanceModel = require("../models/attendance");

const createAttendance = (req, res) => {
  const { inst_ID, std_ID, name, date, classID, attendance, clzName, inTime,
    outTime } =
    req.body;

  const newAttendance = new AttendanceModel({
    inst_ID,
    std_ID,
    name,
    date,
    classID,
    attendance,
    clzName,
    inTime,
    outTime,
  });

  newAttendance
    .save()
    .then((attendance) => res.json(attendance))
    .catch((err) => res.json({ error: err.message }));
};

const getAllAttendances = (req, res) => {
  AttendanceModel.find()
    .then((attendance) => res.json(attendance))
    .catch((err) => res.json({ error: err.message }));
};

const getAllAttendancesByInsId = async (req, res) => {
  const { id } = req.params;

  try {
    const attendances = await AttendanceModel.find({ inst_ID: id }).sort({
      createdAt: -1,
    });

    if (!attendances || attendances.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No attendances found", data: null });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "attendances fetched successfully",
        data: attendances,
      });
  } catch (error) {
    

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getAttendanceCountsByMonth = async (req, res) => {
  const { std_ID } = req.query;

 // console.log(std_ID)

  try {
    // Aggregate pipeline to group attendance records by month and count
    const aggregationPipeline = [
      {
        $match: {
          std_ID: std_ID
        }
      },
      {
        $group: {
          _id: { $month: "$date" }, // Group by month
          count: { $sum: 1 } // Count attendance records
        }
      }
    ];

    // Execute the aggregation pipeline
    const attendanceCounts = await AttendanceModel.aggregate(aggregationPipeline);

    // Format the results
    const formattedAttendanceCounts = attendanceCounts.map(count => ({
      month: count._id,
      count: count.count
    }));

    // Send back the formatted attendance counts
    res.status(200).json({ success: true, data: formattedAttendanceCounts });

    //console.log(formattedAttendanceCounts)
  } catch (error) {
    console.error("Error fetching attendance counts by month:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


const getAttendanceCountByStartDateAndEndDate = async (req, res) => {
  try {
    const { std_ID, startDate, endDate } = req.query;

    // Convert start and end dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // console.log("start date", start);
    // console.log("end date", end);

    // Fetch attendance records for the specified student ID
    const attendanceRecords = await AttendanceModel.find({ std_ID: std_ID });

    // Filter attendance records based on date range
    const filteredRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      // console.log("recordDate", recordDate);
      // console.log("start", start);
      // console.log("end", end);
      return recordDate >= start && recordDate <= end;
    });

    // Get the count of filtered attendance records
    const attendanceCount = filteredRecords.length;

    // console.log("attendanceRecords", attendanceRecords);
    // console.log("attendance count", attendanceCount);

    // Send back the attendance count
    res.status(200).json({ success: true, attendanceCount });
  } catch (error) {
    console.error('Error while fetching attendance count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSwimOutTime = async (req, res) => {
  const { std_ID } = req.params; 
  const { outTime } = req.body; 

  try {
      // Find the student by std_ID
      const attendence = await AttendanceModel.findOne({ std_ID });

      console.log("attendence",attendence)

      if (!attendence) {
          return res.status(404).json({ message: 'attendence not found' });
      }

      // Update swimInTime
      attendence.outTime = outTime;
      await attendence.save(); // Save the updated student record

      console.log("savedAttendence",await attendence.save())

      return res.status(200).json({ message: 'swimOUtTime updated successfully', attendence });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSwimOutTimeByID = async (req, res) => {
  const { id } = req.params; 
  const { outTime } = req.body; 

  console.log("attenID",id)

  try {
      // Find the student by std_ID
      const attendence = await AttendanceModel.findOne({ _id:id });

      console.log("attendence found",attendence)

      if (!attendence) {
          return res.status(404).json({ message: 'attendence not found' });
      }

      // Update swimInTime
      attendence.outTime = outTime;
      await attendence.save(); // Save the updated student record

      console.log("savedAttendence",await attendence.save())

      return res.status(200).json({ message: 'swimOUtTime updated successfully', attendence });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



module.exports = {
  createAttendance,
  getAllAttendances,
  getAllAttendancesByInsId,
  getAttendanceCountsByMonth,
  getAttendanceCountByStartDateAndEndDate,
  updateSwimOutTime,
  updateSwimOutTimeByID
};
