import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

/* ======================================================
   POST APPOINTMENT (PATIENT)
====================================================== */
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    appointment_date,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !doctor_firstName ||
    !doctor_lastName ||
    !address
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const doctor = await User.findOne({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (!doctor) {
    return next(new ErrorHandler("Doctor not found!", 404));
  }

  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited,
    address,
    doctorId: doctor._id,
    patientId: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Appointment Sent Successfully!",
    appointment,
  });
});

/* ======================================================
   GET ALL APPOINTMENTS (ADMIN)
====================================================== */
export const getAllAppointments = catchAsyncErrors(async (req, res) => {
  const appointments = await Appointment.find();

  res.status(200).json({
    success: true,
    appointments,
  });
});

/* ======================================================
   UPDATE APPOINTMENT STATUS (ADMIN + EMAIL)
====================================================== */
export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }

    // Avoid duplicate updates & emails
    if (appointment.status === status) {
      return res.status(200).json({
        success: true,
        message: "Appointment status already updated!",
      });
    }

    appointment.status = status;
    await appointment.save();

    /* ================= EMAIL LOGIC ================= */
    let emailMessage = "";

    if (status === "Accepted") {
      emailMessage = `
Hello ${appointment.firstName} ${appointment.lastName},

✅ Your appointment has been CONFIRMED.

📅 Date: ${appointment.appointment_date}
👨‍⚕️ Doctor: Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}
🏥 Department: ${appointment.department}

Please visit between 11:00 AM to 4:00 PM on the scheduled date.

Thank you,
Hospital Management
`;
    } else if (status === "Rejected") {
      emailMessage = `
Hello ${appointment.firstName} ${appointment.lastName},

❌ Your appointment request has been REJECTED.

📅 Requested Date: ${appointment.appointment_date}
👨‍⚕️ Doctor: Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}

Please try booking another slot.

Thank you,
Hospital Management
`;
    }

    if (status !== "Pending") {
      await sendEmail(
        appointment.email,
        `Appointment ${status}`,
        emailMessage
      );
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully!`,
    });
  }
);

/* ======================================================
   DELETE APPOINTMENT (ADMIN)
====================================================== */
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Appointment Deleted Successfully!",
  });
});
