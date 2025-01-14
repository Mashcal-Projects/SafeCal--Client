import React, { useEffect, useState } from "react";
import { ReportsComp } from "./Reports";
import { MapComp } from "../components/Map";
import { useAuth } from "../context/AuthContext";
import i18n from "../i18n";
import "leaflet/dist/leaflet.css";
import "../styling/dashboard.scss";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { AddReport } from "../components/AddReport";
import { LoginComp } from "../components/auth/Login";

export const DashboardComp = () => {

  console.log("DashboardComp rendered");
  const [addReport, setAddReport] = useState(false);
  const [loginComp, setLoginComp] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const { t } = useTranslation("dashboard");

  useEffect(() => {
    // Update the `dir` attribute based on the current language
    document.documentElement.dir = i18n.language === "he" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    console.log("isLoggedIn in DashboardComp:", isLoggedIn); // Check if this logs true after login
  }, [isLoggedIn]);

  const handleAddReport = () => {
    setAddReport(true);
  };

  const handleLoginButtonClick = () => {
    setLoginComp(true); // Set local login state to true
  };
  const handleLogout = async () => {
    try {
      await logout();
      setLoginComp(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="dashboard">
      <div className="reports-section">
        {isLoggedIn && (
          <div className="add-report-wraaper">
            <Button
              type="primary"
              className="primary-button"
              onClick={handleAddReport}
              size="large"
            >
              {t("add_report")}
            </Button>
            {addReport && <AddReport onClose={() => setAddReport(false)} />}

            {isLoggedIn && (
              <div className="logout-wrapper">
                <Button
                  color="primary"
                  variant="outlined"
                  className="primary-button login-button"
                  onClick={handleLogout}
                  size="large"
                >
                  {t("logout")}
                </Button>
              </div>
            )}
          </div>
        )}

        {!isLoggedIn && (
          <div className="login-wrapper">
            <Button
              type="primary"
              className="primary-button login-button"
              onClick={handleLoginButtonClick}
              size="large"
            >
              {t("login")}
            </Button>
          </div>
        )}

        {loginComp && <LoginComp onClose={() => setLoginComp(false)} />}
        <ReportsComp />
      </div>
      <div className="map-section">
        <MapComp />
      </div>
    </div>
  );
};
