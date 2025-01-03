const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const nodemailer = require("nodemailer");
const Admin = require("../models/adminModel");

// --------- Create a Token
const createToken = (_id, exptime) => {
  return jwt.sign({ _id }, process.env.SECRETKEY, { expiresIn: exptime });
};

// --------- Create exp adte
const getCurrentDatePlusOneDay = () => {
  const currentDate = new Date();
  const oneDayInMillis = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const tomorrowTimestamp = currentDate.getTime() + oneDayInMillis; // Timestamp for tomorrow
  return tomorrowTimestamp;
};

const adminRegister = async (req, res) => {
  const { email, password, role, instituteId } = req.body;

  let emptyFields = [];

  if (!email) {
    emptyFields.push("email");
  }
  if (!password) {
    emptyFields.push("password");
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields", emptyFields });
  }

  try {
    // validation
    if (!instituteId) {
      throw Error("Need InstituteId");
    }

    // check if email already exists
    const exists = await Admin.findOne({ email });

    if (exists) {
      throw Error("Email already in use");
    }

    if (!validator.isEmail(email)) {
      throw Error("Email not valid");
    }

    // generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // create admin
    const admin = await Admin.create({
      email,
      password: hash,
      role,
      instituteId,
    });

    // Send email to the newly registered admin
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Admin Account Details",
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 10px;
              }
              h2 {
                color: #333;
              }
              p {
                margin-bottom: 10px;
              }
              .highlight {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to our platform!</h2>
              <p>Your admin account has been successfully created. Here are your account details:</p>
              <p>Email: ${email}</p>
              <p>Password: <span class="highlight">${password}</span></p>
              <p>Please keep your credentials secure.</p>
              <p>After first login, please change your password immediately.</p>
              <p>This is an automated message.</p>
            </div>
          </body>
        </html>
      `,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(500).json({ error: "Failed to send email" });
      } else {
        return res.status(200).json({ status: "Success", admin });
      }
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// --------- Login a admin
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Incorrect email" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password" });
    }
    const exptime = "1d";
    const tokenExpDate = getCurrentDatePlusOneDay();

    // create a token
    const token = createToken(admin._id, exptime);
    const role = admin.role;

    res
      .status(200)
      .json({ email, role, instituteId: admin.instituteId, tokenExpDate, token});
  } catch (error) {
    
    res.status(500).json({ error: "An error occurred during login." });
  }
};

// --------- forgotpassword a admin
const adminForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      throw Error("Email field must be filled");
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw Error("Incorrect email");
    }
    const exptime = "10m";
    // create a token
    const token = createToken(admin._id, exptime);

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Reset password",
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f9f9f9;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #333;
                margin-bottom: 20px;
              }
              p {
                margin-bottom: 10px;
              }
              .reset-link {
                color: #007bff;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Reset password</h2>
              <p>Hello,</p>
              <p>You have requested to reset your password. Please click on the following link to reset your password:</p>
              <p><a href="https://edu-project-frontend.onrender.com/resetpassword/${admin._id}/${token}" class="reset-link">Reset Password</a></p>
              <p>If you did not request this, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(500).json({ error: "Failed to send email" });
      } else {
        // Move the response outside the callback
        res.status(200).json({ Status: "Success" });
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --------- reset password a admin
const adminResetPassword = async (req, res) => {
  const { password, adminId } = req.body;

  try {
    // Validation
    if (!password || !adminId) {
      throw Error("All fields must be filled");
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Update the password for the admin with the specified adminId
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: { password: hash } },
      { new: true } // Return the updated document
    );

    if (!updatedAdmin) {
      throw Error("Admin not found"); // Handle the case where the admin with the given ID is not found
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --------- Get all admins in one institute
const getAllAdmins = async (req, res) => {
  const { id } = req.params;

  try {
    const admins = await Admin.find({ instituteId: id }).sort({
      createdAt: -1,
    });
    //
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "No admins found", data: null });
    }

    res.status(200).json(admins);
  } catch (error) {
    

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- Get one admin
const getAdmin = async (req, res) => {
  const { id } = req.params;

  //   if (!mongoose.Types.ObjectId.isValid(id)) {
  //     return res.status(400).json({ error: "Invalid institute ID" });
  //   }

  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ error: "No such admin" });
    }

    res.status(200).json(admin);
  } catch (error) {
    // Log the error for debugging purposes
    

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- update a admin
const updateAdmin = async (req, res) => {
  const { id } = req.params;

  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return res.status(400).json({ error: 'Invalid institute ID' });
  // }

  try {
    const admin = await Admin.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({ error: "No such admin found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    // Log the error for debugging purposes
    

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- delete a Admin
const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return res.status(400).json({ error: 'Invalid institute ID' });
  // }

  try {
    const admin = await Admin.findOneAndDelete({ _id: id });

    if (!admin) {
      return res.status(404).json({ error: "No such admin found" });
    }

    res
      .status(200)
      .json({ message: "admin deleted successfully", deletedAdmin: admin });
  } catch (error) {
    // Log the error for debugging purposes
    

    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  adminRegister,
  adminLogin,
  adminForgotPassword,
  getAllAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  adminResetPassword,
};
