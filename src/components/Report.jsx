import React, { useEffect, useState } from "react";
import { useReport } from "../context/ReportContext";
import "../styling/report.scss";
import { useAuth } from "../context/AuthContext";
import { updateReportStatus } from "../services/APIservice";
import ReactDOM from "react-dom";
import { CloseOutlined } from "@ant-design/icons";

export const ReportComp = ({ report, onReportClick }) => {
  const { fetchAddress, addresses, setFilteredReports } = useReport();
  const [address, setAddress] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    getAddress();
  }, [report.latitude, report.longitude, addresses, fetchAddress]);

  const getAddress = async () => {
    const coordKey = `${report.latitude},${report.longitude}`;

    if (addresses && addresses[coordKey]) {
      setAddress(addresses[coordKey]); // Use cached address if available
    } else {
      const fetchedAddress = await fetchAddress(
        report.latitude,
        report.longitude
      );
      setAddress(fetchedAddress);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);

    // Extract parts of the date
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear().toString(); // Last two digits of the year

    // Extract parts of the time
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    // Format the time (12-hour format without AM/PM)
    const formattedTime = `${hours % 12 || 12}:${minutes}`;
    // Combine date and time in the desired format
    return `${day}.${month}.${year}, ${formattedTime}`;
  };

  const handleStatusToggle = async (id, newStatus) => {
    try {
      const updatedReport = await updateReportStatus(id, newStatus);
      setFilteredReports((prevReports) =>
        prevReports.map((report) =>
          report._id === id
            ? { ...report, status: updatedReport.status }
            : report
        )
      );
    } catch (error) {
      console.error("Failed to update report status:", error);
    }
  };

  const handleReportClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Using React portals (allow to render elements in a different part of
  //the DOM while keeping the component logic where it belongs)
  const modalContent = isModalOpen ? (
    <div className="modal-overlay">
      <div className="modal">
        <div className="close-wrapper">
          <button className="close-btn" onClick={handleCloseModal}>
            <CloseOutlined />
          </button>
        </div>
        <div className="modal-content">
          <p>{address}</p>
          <p>{report.value}</p>
          <p>{formatDateTime(report.dateTime)}</p>
          <p>{report.status.toString()}</p>
          <p>{report.safetyLevels}</p>
          <p>{report.image}</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <tr
        className="report"
        onClick={handleReportClick} // Open modal on click
        style={{ cursor: "pointer" }}
      >
        <td className="report-address">{address || "Loading..."}</td>
        <td className="report-name">{report.value}</td>
        <td className="report-dateTime">{formatDateTime(report.dateTime)}</td>
        {user && user.role.toLowerCase() === "admin" && (
          <td className="status-wrapper">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={report.status}
                onChange={() => handleStatusToggle(report._id, !report.status)}
              />
              <span className="slider"></span>
              {/* <p>{report.status ? "טופל" : "לא טופל"}</p> */}
            </label>
          </td>
        )}
      </tr>

      {/* Render modal outside the table using React portal */}
      {ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
};
