import React, { useRef, useState } from "react";
import { registerUser } from "../../Services/APIservice";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import cities from "../../data/israel_cities.json";



export const RegistrationComp = ({ onClose }) => {
  const formRef = useRef(null);
  const { t } = useTranslation("login");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(<EyeInvisibleOutlined />);

  const [selectedOption, setSelectedOption] = useState(null);

  const handleToggle = () => {
    if (type === "password") {
      setIcon(<EyeOutlined />);
      setType("text");
    } else {
      setIcon(<EyeInvisibleOutlined />);
      setType("password");
    }
  };

  // Define validation schema with Yup
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(2, t("validationErrors.nameTooShort"))
      .required(t("validationErrors.fullNameRequired")),
    englishName: Yup.string()
      .min(2, t("validationErrors.nameTooShort"))
      .required(t("validationErrors.englishNameRequired")),
    age: Yup.string()
      .oneOf(
        ["18-25", "26-35", "36-45", "46-60", "60+"], // Valid options
        t("validationErrors.ageRequired") // Error for invalid selection
      )
      .required(t("validationErrors.ageRequired")), // Error for missing selection
    gender: Yup.string()
      .oneOf(["male", "female", "other"], t("validationErrors.validGender"))
      .required(t("validationErrors.genderRequired")),
    city: Yup.string().required(t("validationErrors.cityRequired")),
    phoneNumber: Yup.string()
      .matches(/^\d+$/, t("validationErrors.onlyNumbers")) // Ensures only numeric characters
      .min(10, t("validationErrors.tooShort")) // Minimum length of 10 digits
      .max(15, t("validationErrors.tooLong")) // Maximum length of 15 digits
      .matches(/^\+?[1-9]\d{1,14}$/, t("validationErrors.invalidPhoneNumber")) // Validates phone number format
      .required(t("validationErrors.phoneRequired")), // Ensures the field is not empty
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

  // Initialize Formik with initial values, validation schema, and submit handler
  const formik = useFormik({
    initialValues: {
      fullName: "",
      englishName: "",
      age: "",
      gender: "",
      city: "",
      phoneNumber: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setErrors }) => {
      try {
        await registerUser(values);
      } catch (error) {
        console.error("Error registering user:", error.message);
        const errorKey = error.message; 
        if (errorKey) {
          setErrors({ email: t(`validationErrors.${errorKey}`) });
        } else {
          setErrors({ email: t("validationErrors.unexpectedError") });
        }
      }
    },
  });

  const handleCloseModal = () => {
    onClose();
  };


  const handleChange = (option) => {
     console.log("@@@")
    setSelectedOption(option); // Update the state with the selected option
  };

  return (
    <div className="modal-overlay" style={{ backgroundColor: "unset" }}>
      <div className="modal" ref={formRef}>
        <div className="close-wrapper">
          <button className="close-btn" onClick={handleCloseModal}>
            <CloseOutlined />
          </button>
        </div>

        <h1>{t("registration")}</h1>

        <form onSubmit={formik.handleSubmit}>
          <div className="input-wrapper">
            <div className="input-container">
              <input
                name="fullName"
                type="text"
                placeholder={t("full_name")}
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            <span className="error-message">
              {formik.touched.fullName && formik.errors.fullName
                ? formik.errors.fullName
                : ""}
            </span>
          </div>
          <div className="input-wrapper">
            <div className="input-container">
              <input
                name="englishName"
                type="text"
                placeholder={t("english_name")}
                value={formik.values.englishName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            <span className="error-message">
              {formik.touched.englishName && formik.errors.englishName
                ? formik.errors.englishName
                : ""}
            </span>
          </div>

          <div className="input-wrapper">
            <div className="input-container">
              <select
                name="age"
                className={`gender ${
                  formik.values.gender === "" ? "placeholder" : ""
                }`}
                value={formik.values.age}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="" disabled>
                  {t("age")} 
                </option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-60">46-60</option>
                <option value="60+">60+</option>
              </select>
            </div>
            <span className="error-message">
              {formik.touched.age && formik.errors.age ? formik.errors.age : ""}
            </span>
          </div>

          <div className="input-wrapper">
            <div className="input-container">
              <select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`gender ${
                  formik.values.gender === "" ? "placeholder" : ""
                }`}
              >
                <option value="" disabled>
                  {t("select_gender")}
                </option>
                <option value="male">{t("male")}</option>
                <option value="female">{t("female")}</option>
                <option value="other">{t("other")}</option>
              </select>
            </div>

            <span className="error-message">
              {formik.touched.gender && formik.errors.gender
                ? formik.errors.gender
                : ""}
            </span>
          </div>

          <div className="input-wrapper">
            <div className="input-container">
              <select
                name="city"
                className={`gender ${
                  formik.values.gender === "" ? "placeholder" : ""
                }`}
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="" disabled>
                  {t("city")}
                </option>
                {cities.map((city, index) => (
                  <option key={index} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="error-message">
              {formik.touched.city && formik.errors.city
                ? formik.errors.city
                : ""}
            </span>
          </div>

          <div className="input-wrapper">
            <div className="input-container">
              <input
                id="phone-field"
                name="phoneNumber"
                type="tel"
                placeholder={t("phone_number")}
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            <span className="error-message">
              {formik.touched.phoneNumber && formik.errors.phoneNumber
                ? formik.errors.phoneNumber
                : ""}
            </span>
          </div>

          <div className="input-wrapper">
            <div className="input-container">
              <input
                name="email"
                type="email"
                placeholder={t("email")}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            <span className="error-message">
              {formik.touched.email && formik.errors.email
                ? formik.errors.email
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
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <span
                className="flex justify-around items-center "
                onClick={handleToggle}
              >
                {icon}
              </span>
            </div>
            <span className="error-message">
              {formik.touched.password && formik.errors.password
                ? formik.errors.password
                : ""}
            </span>
          </div>

          <Button
            className="primary-button"
            type="primary"
            size="large"
            htmlType="submit"
          >
            {t("submit_request")}
          </Button>

        </form>
      </div>
    </div>
  );
};
