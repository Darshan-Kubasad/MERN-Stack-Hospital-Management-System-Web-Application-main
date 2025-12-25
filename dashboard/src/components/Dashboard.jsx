/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { Context } from "../main";

const Dashboard = () => {
  const { isAuthenticated, admin } = useContext(Context);

  const [appointments, setAppointments] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);

  /* ================= FETCH APPOINTMENTS ================= */
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/appointment/getall",
          { withCredentials: true }
        );
        setAppointments(data.appointments || []);
      } catch (error) {
        toast.error("Failed to load appointments");
      }
    };

    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctorsCount(data.doctors.length);
      } catch (error) {
        toast.error("Failed to load doctors");
      }
    };

    fetchAppointments();
    fetchDoctors();
  }, []);

  /* ================= UPDATE STATUS ================= */
  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === appointmentId ? { ...item, status } : item
        )
      );

      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  /* ================= AUTH CHECK ================= */
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  /* ================= COUNTS ================= */
  const totalAppointments = appointments.length;

  return (
    <section className="dashboard page">
      {/* ================= HEADER ================= */}
      <div className="banner">
        <div className="firstBox">
          <img src="/doc.png" alt="Doctor" />
          <div className="content">
            <div>
              <p>Hello,</p>
            <h5>
              {admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}
            </h5>
            </div>
            <p>
              Welcome to the admin dashboard. Manage appointments and doctors
              easily from here.
            </p>
          </div>
        </div>

        <div className="secondBox">
          <p>Total Appointments</p>
          <h3>{totalAppointments}</h3>
        </div>

        <div className="thirdBox">
          <p>Registered Doctors</p>
          <h3>{doctorsCount}</h3>
        </div>
      </div>

      {/* ================= APPOINTMENTS TABLE ================= */}
      <div className="banner">
        <h5>Appointments</h5>

        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Status</th>
              <th>Visited</th>
            </tr>
          </thead>

          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    {appointment.firstName} {appointment.lastName}
                  </td>
                  <td>{appointment.appointment_date?.substring(0, 10)}</td>
                  <td>
                    {appointment.doctor.firstName}{" "}
                    {appointment.doctor.lastName}
                  </td>
                  <td>{appointment.department}</td>

                  <td>
                    <select
                      value={appointment.status}
                      className={`value-${appointment.status.toLowerCase()}`}
                      onChange={(e) =>
                        handleUpdateStatus(
                          appointment._id,
                          e.target.value
                        )
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>

                  <td>
                    {appointment.hasVisited ? (
                      <GoCheckCircleFill className="green" />
                    ) : (
                      <AiFillCloseCircle className="red" />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No Appointments Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;
