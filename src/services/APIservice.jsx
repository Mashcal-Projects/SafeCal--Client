import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/register`,
      userData
    );
    if (response.status === 201) {
      console.log("Registration successful:", response.data.message);
    } else {
      console.log("Unexpected response:", response);
    }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || "Registration failed");
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(error.message);
    }
  }
};


const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, userData);
    console.log("Login successful:", response.data);
    return response; // Return response for further handling in the context
  } catch (error) {
    if (error.response) {
      // API returned a response with a non-2xx status code
      console.error("API Error:", error.response.data.error || error.response.statusText);
    } else if (error.request) {
      // No response was received
      console.error("No response from server:", error.request);
    } else {
      // Something else went wrong
      console.error("Request error:", error.message);
    }
    throw error; // Propagate the error to the caller
  }
};


const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/request-password-reset`,
      { email }
    );
    return response.data.message; // Return the message from the server
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw new Error(
      error.response?.data?.message || "Failed to request password reset"
    );
  }
};

const resetPassword = async (token, password) => {
  console.log("ResetPassword Function Called"); // Debug log
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/reset-password/${token}`,
      { password }
    );
    console.log("Backend Response:", response.data);
    return response.data.message; // Return the success message
  } catch (error) {
    console.error("Error resetting password:", error);
    throw new Error(
      error.response?.data?.message || "Failed to reset password"
    );
  }
};

// Fetch all reports
const getAllReports = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reports`);
    return response.data.slice(0, 50); // Limit to 50 for testing; adjust as needed
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

// Fetch address based on latitude and longitude
const getAddress = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=c1f3ebcc8cb14f9f943655813e9e7da3&language=he`
    );
    return response.data.results[0].formatted;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
};
// Update the status of a report
const updateReportStatus = async (id, newStatus) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/reports/${id}`, { status: newStatus });
    return response.data; // Return updated report data if needed
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
};


const addNewReport = async (reportData) => {
  console.log("reportData", reportData);
  try {
    const formData = new FormData();
    // Append all fields to FormData
    Object.keys(reportData).forEach((key) => {
      formData.append(key, reportData[key]);
    });

    // Send the FormData with Axios
    const response = await axios.post(`${API_BASE_URL}/reports`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 201) {
      console.log("Report added successfully:", response.data);
    } else {
      console.log("Unexpected response:", response);
    }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || "Failed to add the report");
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(error.message);
    }
  }
};

export {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
  getAllReports,
  getAddress,
  updateReportStatus,
  addNewReport,
  
};
