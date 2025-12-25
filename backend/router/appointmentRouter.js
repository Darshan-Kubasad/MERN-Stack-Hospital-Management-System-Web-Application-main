import express from "express";
import {
  deleteAppointment,
  getAllAppointments,
  postAppointment,
  updateAppointmentStatus,
} from "../controller/appointmentController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

/* ================= APPOINTMENT ROUTES ================= */

// Patient → Book appointment
router.post("/post", isPatientAuthenticated, postAppointment);

// Admin → Get all appointments
router.get("/getall", isAdminAuthenticated, getAllAppointments);

// Admin → Update appointment status (Accept / Reject)
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);

// Admin → Delete appointment
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;
