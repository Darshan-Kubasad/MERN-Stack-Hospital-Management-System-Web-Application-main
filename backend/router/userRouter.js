import express from "express";
import {
  patientRegister,
  login,
  logoutPatient,
  logoutAdmin,
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
} from "../controller/userController.js";

import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

/* ======================================================
   AUTH ROUTES
====================================================== */
router.post("/patient/register", patientRegister);
router.post("/login", login);

/* ======================================================
   ADMIN ROUTES
====================================================== */
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);

router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

router.get("/admin/me", isAdminAuthenticated, getUserDetails);

router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

/* ======================================================
   PATIENT ROUTES
====================================================== */
router.get("/patient/me", isPatientAuthenticated, getUserDetails);

router.get("/patient/logout", isPatientAuthenticated, logoutPatient);

/* ======================================================
   PUBLIC ROUTES
====================================================== */
router.get("/doctors", getAllDoctors);

export default router;
