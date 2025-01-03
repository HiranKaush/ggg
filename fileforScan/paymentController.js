const PaymentModel = require("../models/paymentModel");

const createPayment = (req, res) => {
  const {
    inst_ID,
    std_ID,
    name,
    amount,
    month,
    classID,
    className,
    status,
    date,
  } = req.body;

  const newPayment = new PaymentModel({
    inst_ID,
    std_ID,
    name,
    amount,
    month,
    classID,
    className,
    status,
    date,
  });

  newPayment
    .save()
    .then((payment) => res.json(payment))
    .catch((err) => res.json({ error: err.message }));
};

const getAllPayments = (req, res) => {
  PaymentModel.find()
    .then((payment) => res.json(payment))
    .catch((err) => res.json({ error: err.message }));
};

const getPaymentStatus = async (req, res) => {
  const { std_ID, classID, month } = req.query;

  try {
    // Assuming your PaymentModel has a field for class name, adjust the query accordingly
    const payment = await PaymentModel.findOne({ std_ID, classID, month });

    if (!payment) {
      return res.status(404).json({ status: "not found" });
    }

    return res.json({ status: payment.status });
  } catch (error) {
    
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllPaymentsByInsId = async (req, res) => {
  const { id } = req.params;

  try {
    const payments = await PaymentModel.find({ inst_ID: id }).sort({
      createdAt: -1,
    });

    if (!payments || payments.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No payments found", data: null });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "payments fetched successfully",
        data: payments,
      });
  } catch (error) {
    

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

;


// Route to get last month's payment status for a student
const getAllPaymentStatusBystdId = async (req, res) => {
  try {
   // console.log("Controller hit: getAllPaymentStatusBystdId");
    const { std_ID } = req.params;
   // console.log("std_ID received:", std_ID);

    const stdIDs = Array.isArray(std_ID) ? std_ID : [std_ID];
    const responses = [];

    for (const id of stdIDs) {
    //  console.log(`Processing std_ID: ${id}`);
      const currentDate = new Date();
      const previousMonthIndex = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const previousMonthName = months[previousMonthIndex];
     // console.log(`Fetching payment for month: ${previousMonthName}`);

      const previousMonthPayment = await PaymentModel.findOne({ std_ID: id, month: previousMonthName });
      if (!previousMonthPayment) {
       // console.log(`No payment record found for std_ID: ${id}`);
        responses.push({ status: "Not paid", month: previousMonthName });
      } else {
        //console.log(`Payment found for std_ID: ${id}, status: ${previousMonthPayment.status}`);
        responses.push({ status: previousMonthPayment.status, month: previousMonthName });
      }
    }

   // console.log("Responses:", responses);
    res.json(responses);
  } catch (error) {
    console.error("Error in getAllPaymentStatusBystdId:", error);
    res.status(500).json({ message: "Server Error" });
  }
};




//goooooood
const calculateMonthlyIncome = async (req, res) => {
  const { classID, month } = req.query;


//console.log(classID,month)

  try {
    const payments = await PaymentModel.find({ classID , month});

    console.log("payments",payments)

    let totalIncome = 0;
    payments.forEach(payment => {
        totalIncome += payment.amount;
    });
   // console.log(totalIncome)
    res.json({ classID, month, totalIncome });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate monthly income" });
  }
};

const calculateDailyIncome = async (req, res) => {
  const { classID  } = req.query;

  // Get today's date
  const today = new Date();
  // Set hours, minutes, seconds, and milliseconds to 0 to compare dates only
  today.setHours(0, 0, 0, 0);

  try {
    // Find payments for the specified classID and today's date
    const payments = await PaymentModel.find({ classID, date: { $gte: today } });

    let totalIncome = 0;
    // Calculate total income for today
    payments.forEach(payment => {
        totalIncome += payment.amount;
    });

    res.json({ classID, date: today, totalIncome });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate daily income" });
  }
};

const calculateMonthlyIncomeByInstID = async (req, res) => {
  const { inst_ID, month } = req.query;


console.log(inst_ID,month)

  try {
    const payments = await PaymentModel.find({ inst_ID , month});

    console.log("payments",payments)

    let totalIncome = 0;
    payments.forEach(payment => {
        totalIncome += payment.amount;
    });
    console.log(totalIncome)
    res.json({ inst_ID, month, totalIncome });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate monthly income" });
  }
};



const calculateDateIncomeByInstID = async (req, res) => {
  const { inst_ID, date } = req.query;
  console.log(inst_ID,date)

  try {
    // Construct a range for the entire day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999); // Set to 23:59:59

    // Find payments within the date range
    const payments = await PaymentModel.find({
      inst_ID,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    console.log(payments)

    let totalIncome = 0;
    payments.forEach(payment => {
      totalIncome += payment.amount;
    });

    res.json({ inst_ID, date, totalIncome });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate daily income" });
  }
};

const calculateIncomeByDate = async (req, res) => {
  const { classID, date } = req.query;

  try {
    // Construct a range for the entire day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0); // Set to 00:00:00
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999); // Set to 23:59:59

    // Find payments within the date range
    const payments = await PaymentModel.find({
      classID,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    console.log(payments)

    let totalIncome = 0;
    payments.forEach(payment => {
      totalIncome += payment.amount;
    });

    res.json({ classID, date, totalIncome });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate daily income" });
  }
};
;

const deletePayment = (req, res) => {
  const id = req.params.id; // Use 'id' instead of '_id' here
  console.log("id", id);
  
  PaymentModel.findByIdAndDelete(id)
    .then((deletedPayment) => {
      if (!deletedPayment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json({ message: "Payment deleted successfully" });
    })
    .catch((err) => {
      console.error("Error deleting payment:", err);
      res.status(500).json({ error: "Failed to delete payment" });
    });
};



// Controller to get payment details by classID
const getPaymentDetailsByClassID = async (req, res) => {
    try {
        const { classID } = req.params;

        // Check if classID is provided
        if (!classID) {
            return res.status(400).json({
                success: false,
                message: "classID is required",
            });
        }

        // Fetch payments for the given classID
        const payments = await PaymentModel.find({ classID });

        // Check if payments exist for the classID
        if (!payments || payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No payment details found for the given classID",
            });
        }

        // Respond with the payment details
        return res.status(200).json({
            success: true,
            data: payments,
        });
    } catch (error) {
        // Handle any errors
        console.error("Error fetching payment details:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching payment details",
        });
    }
};

const getPaymentsByClassId = async (req, res) => {
  const { classId } = req.params; 
  console.log("classiD",classId)
  try {
    // Find all payments where any class in the "classs" array has a matching _id
    const payments = await PaymentModel.find({ "classId": classId });
    console.log("payments",payments)
    // If no students are found, return a not found message
    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No payments found for the given class ID" });
    }

    // Return the students in the response
    res.status(200).json(payments);
  } catch (error) {
    // Handle errors and return a server error response
    console.error("Error fetching payments by class ID:", error);
    res.status(500).json({ message: "An error occurred while fetching payments" });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentStatus,
  getAllPaymentsByInsId,
  getAllPaymentStatusBystdId,
  calculateMonthlyIncome,
  calculateDailyIncome,
  calculateMonthlyIncomeByInstID,
  calculateDateIncomeByInstID,
  calculateIncomeByDate,
  deletePayment,
  getPaymentDetailsByClassID,
  getPaymentsByClassId
};
