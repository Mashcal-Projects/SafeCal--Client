import React, { useEffect, useState } from "react";
import { useReport } from "../context/ReportContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import heIL from "antd/lib/locale/he_IL";
import { Button, DatePicker, ConfigProvider, Alert, notification } from "antd";
import {
  FrownOutlined,
  MehOutlined,
  SmileOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import "../styling/login.scss";
import { addNewReport } from "../Services/APIservice";
import FileUpload from "./FileUpload";

export const AddReport = (props) => {
  const { t } = useTranslation("report");
  const { fetchAddress, setReports, setFilteredReports } = useReport();
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  }); //Save the long and lat for saving to DB after submit
  const [selectedSafetyLevel, setSelectedSafetyLevel] = useState(null); // Track selected icon
  const [loading, setLoading] = useState(false); // Track loading state

  // Get options dynamically from translations
  const options = Object.entries(t("options", { returnObjects: true }) || {});
  const [newReportAdded, setNewReportAdded] = useState(false);

  const [isListening, setIsListening] = useState(false);
  // const [recognition, setRecognition] = useState(null);

  const safetyLevels = [
    {
      value: 1,
      label: t("very_unsafe"),
      icon: <FrownOutlined style={{ fontSize: "30px", color: "#ff4d4f" }} />,
    },
    {
      value: 2,
      label: t("unsafe"),
      icon: <FrownOutlined style={{ fontSize: "30px", color: "#ffa940" }} />,
    },
    {
      value: 3,
      label: t("neutral"),
      icon: <MehOutlined style={{ fontSize: "30px", color: "#ffc107" }} />,
    },
    {
      value: 4,
      label: t("safe"),
      icon: <SmileOutlined style={{ fontSize: "30px", color: "#52c41a" }} />,
    },
    {
      value: 5,
      label: t("very_safe"),
      icon: <SmileOutlined style={{ fontSize: "30px", color: "#389e0d" }} />,
    },
  ];

  // Define validation schema with Yup
  const validationSchema = Yup.object({
    value: Yup.string()
      .required(t("validationErrors.nameRequired"))
      .test(
        "not-placeholder",
        t("validationErrors.invalidName"), // Error message
        (value) => value !== "" // Ensure the value is not the placeholder
      ),
    location: Yup.string().required(t("validationErrors.locationRequired")), // Required field validation

    safetyLevel: Yup.mixed()
      .required(t("validationErrors.safetyLevelRequired")) // Ensure a selection is made
      .oneOf(
        safetyLevels.map((level) => level.value),
        t("validationErrors.invalidSafetyLevel") // Error message for invalid selection
      ),
    image: Yup.mixed()
      .required("An image is required")
      .test(
        "fileSize",
        "File size is too large (max 2MB)",
        (value) => !value || (value && value.size <= 2000000)
      )
      .test(
        "fileType",
        "Unsupported file format. Only JPEG/PNG allowed",
        (value) =>
          !value || (value && ["image/jpeg", "image/png"].includes(value.type))
      ),
    // imageUpload: Yup.mixed()
    //   .required("An image is required") // Ensures the file is required
    //   .test(
    //     "fileSize",
    //     "File size is too large. Maximum size is 2MB.",
    //     (value) => !value || (value && value.size <= 2000000) // 2MB size limit
    //   )
    //   .test(
    //     "fileType",
    //     "Unsupported file format. Only JPG, PNG are allowed.",
    //     (value) =>
    //       !value || (value && ["image/jpeg", "image/png"].includes(value.type)) // Restrict file type
    //   ),
  });

  // Initialize Formik with initial values, validation schema, and submit handler
  const formik = useFormik({
    initialValues: {
      value: "",
      location: "",
      safetyLevel: "",
      image: null,
    },
    validationSchema,

    onSubmit: async (values, { setErrors }) => {
      console.log("on submit");
      const newReport = {
        ...values, // Include other form fields
        latitude: coordinates.latitude, // Include latitude
        longitude: coordinates.longitude, // Include longitude
      };
      try {
        // Call the addNewReport function to send the data to the server
        await addNewReport(newReport);
        setReports((prevReports) => [...prevReports, newReport]);
        setFilteredReports((prevFilteredReports) => [
          ...prevFilteredReports,
          newReport,
        ]);
        setNewReportAdded(true);
        console.log("Report added successfully!");

        // Show success notification
        notification.success({
          message: t("success_message"),
          // description: ,
          placement: "topRight",
          duration: 5, // Toast disappears after 3 seconds
        });

        // Close the report submission component
        props.onClose();
      } catch (error) {
        console.error("Error adding report:", error.message);
        // Show error notification

        // Handle specific errors (example: handle based on server error response)
        const errorKey = error.response?.data?.error; // Assuming the server returns an 'error' field
        if (errorKey) {
          setErrors({ location: t(`validationErrors.${errorKey}`) });
        } else {
          setErrors({ location: t("validationErrors.unexpectedError") });
        }
      }
    },
  });

  useEffect(() => {
    const now = new Date();
    formik.setFieldValue("dateTime", now);

    // Automatically fetch user's location and resolve address
    const getLocation = async () => {
      setLoading(true); // Start loader
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            setCoordinates({ latitude, longitude }); // Save to state
            const fetchedAddress = await fetchAddress(latitude, longitude);
            console.log("fetched Address useEffect:", fetchedAddress);

            if (fetchedAddress.toLowerCase().includes("unnamed road")) {
              formik.setFieldError(
                "location",
                "Address not found. Please enter the full address manually."
              );
              formik.setFieldValue("location", ""); // Clear the location field
            } else {
              formik.setFieldValue("location", fetchedAddress); // Sync with Formik
              
              formik.setFieldError("location", ""); // Clear any existing error
            }
          } catch (error) {
            formik.setFieldError(
              "location",
              "Unable to fetch address. Please try again."
            );
          } finally {
            setLoading(false); // Stop loader
          }
        },
        (error) => {
          formik.setFieldError(
            "location",
            "Unable to retrieve location. Please allow location access."
          );
          setLoading(false); // Stop loader
        }
      );
    };

    getLocation();
  }, []);

  const handleIconClick = (value) => {
    setSelectedSafetyLevel(value);
    formik.setFieldValue("safetyLevel", value); // Update Formik state
  };

  const validateAddress = async (address) => {
    if (!address || address.trim().length < 5) {
      formik.setFieldError(
        "location",
        t("validationErrors.minimumCharacters", { min: 5 })
      );
      return;
    }

    try {
      setLoading(true);
      // Query Nominatim API for the entered address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&format=json&addressdetails=1&accept-language=he&countrycodes=IL&limit=1`
      );

      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
        const result = data[0].display_name;
        // Ensure the result matches Hebrew localization and Israel
        if (result.includes("ישראל") || /[\u0590-\u05FF]/.test(result)) {
          formik.setFieldValue("location", result); // Update Formik with validated address
          formik.setFieldError("location", ""); // Clear errors
        } else {
          formik.setFieldError(
            "location",
            t("validationErrors.invalidAddressInRegion")
          );
        }
      } else {
        formik.setFieldError("location", t("validationErrors.invalidAddress"));
      }
    } catch (error) {
      console.error("Address validation error:", error);
      formik.setFieldError("location", t("validationErrors.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file) => {
    formik.setFieldValue("image", file);
    console.log("Selected File:", file);
  };

  const processTranscript = (transcript) => {
    const lowerTranscript = transcript.toLowerCase();
    console.log("lowerTranscript", lowerTranscript);

    // Match report type
    const reportMatch = Object.entries(options).find(([key, value]) => {
      console.log("value ", value);
      return lowerTranscript.trim().includes(value[1]); // Ensure to return the condition
    });

    if (reportMatch) {
      const [matchedKey, matchedValue] = reportMatch;
      console.log("matchedKey", matchedKey, "matchedValue", matchedValue);
      formik.setFieldValue("value", matchedValue[1]); // Set the matched key
    } else {
      console.log("No match found for report type");
    }
    console.log("formik.values.value after set", formik.values.value);
    // Step 1: Remove day-related and time-related keywords

    const cleanedText = lowerTranscript
      .replace(/(?:אתמול|היום|מחר)/g, "") // Remove day-related keywords
      .replace(/(?:בשעה\s*\d{1,2}:\d{2}|ב\s*\d{1,2}:\d{2})/g, "") // Remove time-related phrases
      .trim();
    // Extract location using multiple possible keywords
    // const locationMatch = cleanedText.match(
    //   /(?:ברחוב|במיקום|ב)\s*([\u0590-\u05FF\s\d]+)\s*(?=הייתה|היה|היו|$)/
    // ); // Match after "ברחוב", "במיקום", or "ב"

    // Step 2: Match location keywords and capture road name + number + city
    const locationMatch = cleanedText.match(
      /(?:ברחוב|במיקום|ב)\s*([\u0590-\u05FF\s\d]+)\s*(?=הייתה|היה|היו|$)/
    ); // Match location, stop at "ה" or end of string

    console.log("locationMatch", locationMatch);
    if (locationMatch) {
      let location = locationMatch[1].trim();
      console.log("Extracted location:", location);
      // Step 3: Clean up additional prefixes (e.g., "ה ", "ב ") and irrelevant text
      location = location.replace(/^(ה|ב)\s*/, ""); // Remove leading "ה " or "ב "
      location = location.replace(/\s{2,}/g, " ").trim(); // Remove extra spaces
      formik.setFieldValue("location", location); // Set the extracted location
    } else {
      console.log("No location found in transcript");
    }

    const mapSafetyLevel = (text) => {
      if (text.includes("מסוכן מאוד")) return 1;
      if (text.includes("מסוכן")) return 2;
      if (text.includes("ניטרלי")) return 3;
      if (text.includes("בטוח")) return 4;
      if (text.includes("בטוח מאוד")) return 5;
      return "";
    };

    if (
      lowerTranscript.includes("בטוח מאוד") ||
      lowerTranscript.includes("בטוח") ||
      lowerTranscript.includes("ניטרלי") ||
      lowerTranscript.includes("מסוכן") ||
      lowerTranscript.includes("מסוכן מאוד")
    ) {
      const safetyLevel = mapSafetyLevel(lowerTranscript);
      formik.setFieldValue("safetyLevel", safetyLevel);
    }
    const extractDateTime = (text) => {
      let parsedDate = dayjs();

      if (text.includes("היום")) {
        parsedDate = dayjs();
      }

      if (text.includes("אתמול")) {
        parsedDate = dayjs().subtract(1, "day");
      }
      // Extract time (e.g., "בשעה 7:30" or "ב7:30")
      const timeMatch = text.match(/(?:בשעה\s*|ב\s*)(\d{1,2}):(\d{2})/); // Matches "בשעה 7:30" or "ב7:30"
      console.log("timeMatch", timeMatch);
      if (timeMatch) {
        const [_, hours, minutes] = timeMatch; // Extract hours and minutes
        parsedDate = parsedDate
          .set("hour", parseInt(hours, 10))
          .set("minute", parseInt(minutes, 10));
      }
      console.log("parsedDate", parsedDate);

      return parsedDate;
    };

    if (
      lowerTranscript.includes("היום") ||
      lowerTranscript.includes("שעה") ||
      lowerTranscript.includes("אתמול") ||
      lowerTranscript.includes("מחר")
    ) {
      const dateTime = extractDateTime(lowerTranscript);
      console.log("dateTime", dateTime);
      if (dateTime) {
        formik.setFieldValue("dateTime", dateTime.toISOString());
      }
    }
  };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("זיהוי דיבור אינו נתמך בדפדפן זה.");
      return;
    }

    const speechRecognition = new window.webkitSpeechRecognition();
    speechRecognition.lang = "he-IL";
    speechRecognition.interimResults = false;

    // setRecognition(speechRecognition);
    setIsListening(true);
    speechRecognition.start();

    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processTranscript(transcript);
      setIsListening(false);
    };

    speechRecognition.onerror = () => setIsListening(false);
    speechRecognition.onend = () => setIsListening(false);
  };
  return (
    <>
      <div className="modal-overlay">
        <div className="modal">
          <div className="close-wrapper">
            <button className="close-btn" onClick={props.onClose}>
              <CloseOutlined />
            </button>
          </div>

          <h1>{t("report_details")}</h1>
          <form onSubmit={formik.handleSubmit}>
            <div className="detalis-wrapper">
              <div className="input-wrapper">
                <div className="input-container">
                  <select
                    id="value"
                    name="value"
                    value={formik.values.value}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    style={{ width: "100%" }}
                  >
                    <option value="">{t("report")}</option>
                    {options.map(([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="error-message">
                  {formik.touched.value && formik.errors.value
                    ? formik.errors.value
                    : ""}
                </span>
              </div>

              {/* Address Input Field */}
              <div className="input-wrapper">
                <div className="input-container">
                  {loading ? (
                    <div className="loader">
                      {/* Add your loading spinner oranimation here */}
                      <span>{t("loading_location")}</span>
                    </div>
                  ) : (
                    <>

                    {/* when open get location by defalut  */}
                      <input
                        id="location"
                        name="location"
                        value={formik.values.location}
                        onChange={formik.handleChange} // Update Formik state
                        onBlur={() => validateAddress(formik.values.location)} // Validate onBlur
                        placeholder={t("location_placeholder")}
                      />
                      {formik.touched.location && !formik.errors.location && (
                        <span className="valid-icon">✅</span> // Icon for valid address
                      )}
                      {formik.errors.location && (
                        <span className="error-icon">❌</span> // Icon for invalid address
                      )}
                    </>
                  )}
                </div>
                <span className="error-message" style={{ textAlign: "center" }}>
                  {formik.touched.location && formik.errors.location
                    ? formik.errors.location
                    : ""}
                </span>
              </div>

              {/* Date and Time Picker */}
              <div className="input-wrapper">
                <div className="input-container">
                  <ConfigProvider locale={heIL} direction="rtl">
                    <DatePicker
                      showTime
                      value={
                        formik.values.dateTime
                          ? dayjs(formik.values.dateTime)
                          : null
                      } // Convert ISO string to dayjs
                      onChange={(value) =>
                        formik.setFieldValue(
                          "dateTime",
                          value ? value.toISOString() : null
                        )
                      }
                      defaultValue={dayjs()} // Default to current date and time
                      format="YYYY-MM-DD HH:mm" // Customize format
                      name="dateTime"
                      style={{ border: "unset", width: "100%" }}
                      disabledDate={(current) => {
                        // Disable dates in the future
                        return current && current > dayjs().endOf("day");
                      }}
                      disabledTime={(current) => {
                        // Disable time if the selected date is today and the time is in the future
                        if (current && dayjs(current).isSame(dayjs(), "day")) {
                          return {
                            disabledHours: () =>
                              Array.from({ length: 24 }, (_, i) =>
                                i > dayjs().hour() ? i : null
                              ).filter((hour) => hour !== null),
                            disabledMinutes: () =>
                              dayjs().minute() < 59
                                ? Array.from({ length: 60 }, (_, i) =>
                                    i > dayjs().minute() ? i : null
                                  ).filter((minute) => minute !== null)
                                : [],
                          };
                        }
                        return {};
                      }}
                    />
                  </ConfigProvider>
                </div>
                <span className="error-message">
                  {formik.touched.dateTime && formik.errors.dateTime
                    ? formik.errors.dateTime
                    : ""}
                </span>
              </div>
              <FileUpload
                selectedFile={formik.values.image}
                onFileChange={handleFileChange}
              />
            </div>

            {/* safetyLevels  */}
            <div className="safetyLevels-wrapper">
              <h4 style={{ textAlign: "center", marginBottom: "20px" }}>
                {t("question")}
              </h4>
              <div className="icon-group">
                {safetyLevels.map((level) => (
                  <div
                    key={level.value}
                    className={`icon-wrapper ${
                      selectedSafetyLevel === level.value ? "selected" : ""
                    }`}
                    onClick={() => handleIconClick(level.value)} // Handle click
                    style={{ cursor: "pointer" }}
                  >
                    {level.icon}
                    <p style={{ fontSize: "12px", marginTop: "5px" }}>
                      {level.label}
                    </p>
                  </div>
                ))}
              </div>
              <span className="error-message" style={{ textAlign: "center" }}>
                {formik.touched.safetyLevel && formik.errors.safetyLevel
                  ? formik.errors.safetyLevel
                  : ""}
              </span>
            </div>

            {/* <Button onClick={startVoiceInput}>
              🎤 {isListening ? "מקשיב..." : "התחל הקלטה"}
            </Button> */}
            <Button
              className="primary-button"
              type="primary"
              htmlType="submit"
              size="large"
            >
              {t("submit")}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};
