import React from "react";
import { useParams } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "antd";
import { resetPassword } from "../../services/APIservice";
import "../../styling/resetPassword.scss";
import { useTranslation } from "react-i18next";

export const ResetPasswordComp = () => {
  const { token } = useParams(); // Extract token from URL

  const { t } = useTranslation("login");
  const resetFormik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          t("validationErrors.passwordComplexity")
        )
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values, { setStatus }) => {
      try {
        const message = await resetPassword(token, values.password);
        setStatus({ success: message.message, error: null }); // Clear previous error
      } catch (error) {
        setStatus({ success: null, error: error.message }); // Clear previous success
      }
    },
  });

  return (
    // <div className="resetPassword">
    //   <div className="resetPassword-container">

    <div className="modal-overlay" style={{ backgroundColor: "unset" }}>
      <div className="modal">
        <h1>{t("reset_password")}</h1>
        <form onSubmit={resetFormik.handleSubmit}>
          <div className="input-wrapper">
            <div className="input-container">
              <input
                name="password"
                type="password"
                placeholder="Enter new password"
                value={resetFormik.values.password}
                onChange={resetFormik.handleChange}
                onBlur={resetFormik.handleBlur}
              />
            </div>
            <span className="error-message">
              {resetFormik.touched.password && resetFormik.errors.password
                ? resetFormik.errors.password
                : ""}
            </span>
          </div>

          {/* Confirm Password Input */}
          <div className="input-wrapper">
            <div className="input-container">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={resetFormik.values.confirmPassword}
                onChange={resetFormik.handleChange}
                onBlur={resetFormik.handleBlur}
              />
            </div>
            <span className="error-message">
              {resetFormik.touched.confirmPassword &&
              resetFormik.errors.confirmPassword
                ? resetFormik.errors.confirmPassword
                : ""}
            </span>
          </div>

          {/* Submit Button */}
          <Button
            className="primary-button"
            type="primary"
            size="large"
            htmlType="submit"
            disabled={resetFormik.isSubmitting}
          >
            {resetFormik.isSubmitting ? "Submitting..." : t("reset_password")}
          </Button>
          {/* Success and Error Messages */}
          {resetFormik.status?.success && (
            <div className="success-message">{t("reset_success")}</div>
          )}
          {resetFormik.status?.error && (
            <div className="error-message">{t("reset_error")}</div>
          )}
        </form>
      </div>
    </div>
  );
};
