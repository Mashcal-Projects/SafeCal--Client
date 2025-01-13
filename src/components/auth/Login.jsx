import React, { useEffect, useState } from "react";
import "../../styling/login.scss";
import { CloseOutlined, MailOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { RegistrationComp } from "./Registration";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../context/AuthContext";
import { requestPasswordReset } from "../../Services/APIservice";

export const LoginComp = (props) => {
  const [type, setType] = useState("password");
  const [forgetPassword, setForgetPassword] = useState("");
  const [registration, setRegistration] = useState(false);
  const [icon, setIcon] = useState(<EyeInvisibleOutlined />);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation("login");
  const { login } = useAuth(); // Use login from AuthContext

  const handleToggle = () => {
    if (type === "password") {
      setIcon(<EyeOutlined />);
      setType("text");
    } else {
      setIcon(<EyeInvisibleOutlined />);
      setType("password");
    }
  };

  const handleRegistrationForm = () => {
    setRegistration(true);
    setForgetPassword(false);
  };

  // Validation schema for login form
  const loginValidationSchema = Yup.object({
    email: Yup.string()
      .email(t("validationErrors.invalidEmail"))
      .required(t("validationErrors.emailRequired")),
      password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        t("validationErrors.passwordComplexity")
      )
      .required(t("validationErrors.passwordRequired")),
  });

  // Validation schema for reset password form
  const resetValidationSchema = Yup.object({
    email: Yup.string()
      .email(t("validationErrors.invalidEmail"))
      .required(t("validationErrors.emailRequired")),
  });

  // Formik for login form
  const loginFormik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        setErrorMessage(""); // Clear previous errors
        await login(values); // Call login from context
        props.onClose(); 
      } catch (error) {
        setErrorMessage(error.message);
        console.error("Error logging in:", error);
      }
    },
  });

  // Formik for reset password form
  const resetFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: resetValidationSchema,
    onSubmit: async (values, { setStatus }) => {
      try {
        const responseMessage = await requestPasswordReset(values.email);
        setStatus({ success: responseMessage });
        setForgetPassword(false);
      } catch (error) {
        setStatus({ error: error.response?.data?.message || t("reset_error") });
      }
    },
  });

  function SuccessScreen() {
    const onOpenEmailApp = () => {
      window.location.href = "mailto:";
    };
    return (
      <div className="success-screen">
        <div className="icon-container">
          <MailOutlined className="email-icon" />
        </div>
        <h2 className="success-title">{t("check_mail")}</h2>
        <p className="success-message">{t("mail_instruction")}</p>
        <Button
          className="primary-button"
          type="primary"
          size="large"
          onClick={onOpenEmailApp}
          style={{ margin: "10px 0" }}
        >
          {t("open_email_app")}
        </Button>
        <Button
          className="primary-button"
          color="primary"
          size="large"
          variant="outlined"
          onClick={props.onClose}
        >
          {t("skip")}
        </Button>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="close-wrapper">
          <button className="close-btn" onClick={props.onClose}>
            <CloseOutlined />
          </button>
        </div>
        {!forgetPassword && !registration && !resetFormik.status?.success && (
          <div className="form-wrapper">
            <h1>{t("login")}</h1>
            <form onSubmit={loginFormik.handleSubmit}>
              <div className="input-wrapper">
                <div className="input-container">
                  <input
                    name="email"
                    type="email"
                    placeholder={t("email")}
                    value={loginFormik.values.email}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                  />
                </div>
                <span className="error-message">
                  {loginFormik.touched.email && loginFormik.errors.email
                    ? loginFormik.errors.email
                    : ""}
                </span>
              </div>
              <div className="input-wrapper">
                <div
                  className="input-container"
                  style={{
                    justifyContent: "space-between",
                  }}
                >
                  <input
                    name="password"
                    type={type}
                    placeholder={t("password")}
                    value={loginFormik.values.password}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                  />
                  <span
                    className="flex justify-around items-center "
                    onClick={handleToggle}
                  >
                    {icon}
                  </span>
                  
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <span className="error-message">
                  {loginFormik.touched.password && loginFormik.errors.password
                    ? loginFormik.errors.password
                    : ""}
                </span>
              
              </div>

              <div>
                <Button
                  onClick={() => setForgetPassword(true)}
                  type="link"
                  style={{
                    padding: "0",
                    height: "unset",
                    textAlign: "start",
                    direction: "ltr",
                  }}
                >
                  {t("forgot_password")}
                </Button>
              </div>
              <Button
                className="primary-button"
                type="primary"
                htmlType="submit"
                size="large"
                style={{ margin: "10px 0" }}
              >
                {t("login")}
              </Button>
              <Button
                className="primary-button"
                color="primary"
                size="large"
                variant="outlined"
                onClick={() => setRegistration(true)}
              >
                {t("no_account")}
              </Button>
            </form>
          </div>
        )}
        {forgetPassword ? (
          <div className="resetPassword">
            <h1>{t("reset_password")}</h1>
            <p>{t("forgotten_text")}</p>
            <form onSubmit={resetFormik.handleSubmit}>
              <div className="input-wrapper">
                <div className="input-container">
                  <input
                    name="email"
                    type="email"
                    placeholder={t("email")}
                    value={resetFormik.values.email}
                    onChange={resetFormik.handleChange}
                    onBlur={resetFormik.handleBlur}
                  />
                </div>
                <span className="error-message">
                  {resetFormik.touched.email && resetFormik.errors.email
                    ? resetFormik.errors.email
                    : ""}
                </span>
              </div>

              <Button
                className="primary-button"
                type="primary"
                size="large"
                htmlType="submit"
                loading={resetFormik.isSubmitting}
              >
                {t("reset")}
              </Button>
              {resetFormik.status?.error && (
                <div className="error-message">
                  {resetFormik.status.error.message}
                </div>
              )}
            </form>

            <Button
              type="link"
              style={{
                padding: "0",
                height: "unset",
                textAlign: "start",
              }}
              onClick={handleRegistrationForm}
            >
              {t("no_account")}
            </Button>
          </div>
        ) : (
          resetFormik.status?.success && <SuccessScreen onClose={props.close} />
        )}
        {registration && (
          <RegistrationComp onClose={() => setRegistration(false)} />
        )}
      </div>
    </div>
  );
};
