const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const nodemailer = require("nodemailer");
const Teacher = require("../models/teacher");

// --------- Create a Token
const createToken = (_id, exptime) => {
  return jwt.sign({ _id }, process.env.SECRETKEY, { expiresIn: exptime });
};

// --------- Create exp date
const getCurrentDatePlusOneDay = () => {
  const currentDate = new Date();
  const oneDayInMillis = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const tomorrowTimestamp = currentDate.getTime() + oneDayInMillis;
  return tomorrowTimestamp;
};

// --------- Register a Teacher
const teacherRegister = async (req, res) => {
  const { email, password, role,name, instituteId,classId } = req.body;

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
    if (!instituteId) {
      throw Error("Need InstituteId");
    }

    const exists = await Teacher.findOne({ email });
    if (exists) {
      throw Error("Email already in use");
    }

    if (!validator.isEmail(email)) {
      throw Error("Email not valid");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const teacher = await Teacher.create({
      email,
      password: hash,
      role,
      name,
      instituteId,
      classId
    });

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
      subject: "Teacher Account Details",
      html: `
        <html>
          <body>
            <h2>Welcome!</h2>
            <p>Your teacher account has been created:</p>
            <p>Email: ${email}</p>
            <p>Password: ${password}</p>
          </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ error: "Failed to send email" });
      } else {
        return res.status(200).json({ status: "Success", teacher });
      }
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// --------- Login a Teacher
const teacherLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("email",email,password)

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ error: "Incorrect email" });
    }

    const match = await bcrypt.compare(password, teacher.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const exptime = "1d";
    const tokenExpDate = getCurrentDatePlusOneDay();

    const token = createToken(teacher._id, exptime);
    const role = teacher.role;

    res
      .status(200)
      .json({ email, role, instituteId: teacher.instituteId, tokenExpDate, token });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during login." });
  }
};

// --------- Forgot Password for Teacher
const teacherForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      throw Error("Email field must be filled");
    }

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      throw Error("Incorrect email");
    }

    const exptime = "10m";
    const token = createToken(teacher._id, exptime);

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
      subject: "Reset Password",
      html: `<p>Click <a href="https://edu-project-frontend.onrender.com/resetpassword/${teacher._id}/${token}">here</a> to reset your password.</p>`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        res.status(500).json({ error: "Failed to send email" });
      } else {
        res.status(200).json({ status: "Success" });
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --------- Reset Password for Teacher
const teacherResetPassword = async (req, res) => {
  const { password, teacherId } = req.body;

  try {
    if (!password || !teacherId) {
      throw Error("All fields must be filled");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: { password: hash } },
      { new: true }
    );

    if (!updatedTeacher) {
      throw Error("Teacher not found");
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --------- Get One Teacher
const getTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ error: "No such teacher" });
    }

    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- Update a Teacher
const updateTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const teacher = await Teacher.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({ error: "No such teacher found" });
    }

    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- Delete a Teacher
const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const teacher = await Teacher.findOneAndDelete({ _id: id });
    if (!teacher) {
      return res.status(404).json({ error: "No such teacher found" });
    }

    res
      .status(200)
      .json({ message: "Teacher deleted successfully", deletedTeacher: teacher });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- Get All Teachers By InstituteId
const getTeachersByInstituteId = async (req, res) => {
  const { instituteId } = req.params;

  try {
    // Find all teachers with the given instituteId
    const teachers = await Teacher.find({ instituteId });

    if (teachers.length === 0) {
      return res.status(404).json({ error: "No teachers found for this institute" });
    }

    // Return the list of teachers
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to get teacher by email
const getTeacherByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        // Validate that email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Find the teacher by email
        const teacher = await Teacher.findOne({ email });

        // If no teacher is found
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "No teacher found with the given email",
            });
        }

        // Respond with the teacher details
        return res.status(200).json({
            success: true,
            data: teacher,
        });
    } catch (error) {
        // Handle any errors
        console.error("Error fetching teacher by email:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching teacher details",
        });
    }
};


module.exports = {
  teacherRegister,
  teacherLogin,
  teacherForgotPassword,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  teacherResetPassword,
  getTeachersByInstituteId,
  getTeacherByEmail
};
