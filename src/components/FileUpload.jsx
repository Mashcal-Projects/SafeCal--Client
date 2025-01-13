import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "../styling/FileUpload.scss";

const FileUpload = ({ onFileChange,selectedFile }) => {
  const { t } = useTranslation("report");
//   const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file) => {
    // setSelectedFile(file);
    if (onFileChange) onFileChange(file);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  const handleCancelFile = (e) => {
    e.preventDefault();
    // setSelectedFile(null);
    if (onFileChange) onFileChange(null); // Notify parent component
  };

  return (
    <div
      className={`file-upload-container ${dragActive ? "drag-active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />
      <label htmlFor="fileInput" className="file-upload-label">
        {selectedFile ? (
          <span>
            {`${t("selected_file")}: ${selectedFile.name}`}

            <button
              type="button"
              className="close-btn"
              onClick={(e) => handleCancelFile(e)}
              style={{
                fontSize: "15px",
                backgroundColor: "transparent",
                border: "none",
                margin: "0 8px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              x
            </button>
          </span>
        ) : (
          <span>
            {t("drag_drop")}{" "}
            <span className="choose-file">{t("choose_file")}</span>
          </span>
        )}
      </label>
    </div>
  );
};

export default FileUpload;
