import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import cloudinary from "cloudinary";

/* ================= PATIENT REGISTER ================= */
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, dob, gender, password } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    role: "Patient",
  });

  /* ===== SEND WELCOME EMAIL ===== */
  const message = `
Hello ${firstName} ${lastName},


🎉 Welcome to Hospital Management System!

Thank you for registering with us.
We’re glad to have you as part of our healthcare community.

Stay healthy,
Hospital Management Team

`;

  await sendEmail(email, "Welcome to Hospital Management System", message);

  generateToken(user, "User Registered Successfully! Email Sent.", 200, res);
});

/* ================= LOGIN ================= */
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  if (role !== user.role) {
    return next(new ErrorHandler("User Not Found With This Role!", 400));
  }

  generateToken(user, "Login Successfully!", 201, res);
});

/* ================= ADD ADMIN ================= */
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, dob, gender, password } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New Admin Registered",
    admin,
  });
});

/* ================= ADD DOCTOR ================= */
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.docAvatar) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }

  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Doctor With This Email Already Exists!", 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});

/* ================= GET ALL DOCTORS + TOTAL ================= */
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  const totalDoctors = doctors.length;

  res.status(200).json({
    success: true,
    totalDoctors,
    doctors,
  });
});

/* ================= USER DETAILS ================= */
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

/* ================= LOGOUT ADMIN ================= */
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.status(201).cookie("adminToken", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
    sameSite: isProd ? 'None' : 'Lax',
    secure: isProd,
    path: '/',
  }).json({
    success: true,
    message: "Admin Logged Out Successfully.",
  });
});

/* ================= LOGOUT PATIENT ================= */
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.status(201).cookie("patientToken", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
    sameSite: isProd ? 'None' : 'Lax',
    secure: isProd,
    path: '/',
  }).json({
    success: true,
    message: "Patient Logged Out Successfully.",
  });
});
