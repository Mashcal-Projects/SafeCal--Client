import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllReports, getAddress } from "../services/APIservice";
import {
  getFromLocalStorage,
  setInLocalStorage,
} from "../services/SecureStorage";

const ReportContext = createContext();

export const useReport = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState(
    JSON.parse(getFromLocalStorage("reports")) || []
  );

  const [filteredReports, setFilteredReports] = useState(
    JSON.parse(getFromLocalStorage("filteredReports")) || []
  );

  const [addresses, setAddresses] = useState(
    JSON.parse(getFromLocalStorage("addresses")) || {}
  );

  const [loading, setLoading] = useState(!reports.length); // If reports are already in localStorage, start as not loading

  useEffect(() => {
    setInLocalStorage("reports", JSON.stringify(reports));
    setInLocalStorage("filteredReports", JSON.stringify(filteredReports));
    setInLocalStorage("addresses", JSON.stringify(addresses));
  }, [reports, filteredReports, addresses]);

  const fetchReports = async () => {
    if (reports.length > 0 && filteredReports.length > 0) return;
    setLoading(true);

    try {
      const data = await getAllReports();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddress = async (lat, lon) => {
    const coordKey = `${lat},${lon}`;
    if (addresses[coordKey]) return addresses[coordKey]; // Return cached address

    try {
      const fullAddress = await getAddress(lat, lon);
      const formattedAddress = formatAddress(fullAddress);

      setAddresses((prev) => {
        const updatedAddresses = { ...prev, [coordKey]: formattedAddress };
        setInLocalStorage("addresses", JSON.stringify(updatedAddresses));
        return updatedAddresses;
      });

      return formattedAddress;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  // // Helper function to format the address
  const formatAddress = (address) => {
    if (!address.includes(",")) return address; // No comma, return as-is

    // Split at the first comma
    const [firstPart, secondPart] = address.split(",", 2);

    // Remove numbers from the second part using a regex
    const cleanedSecondPart = secondPart.replace(/\d+/g, "").trim();

    // Combine and return the cleaned address
    return `${firstPart}, ${cleanedSecondPart}`;
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        addresses,
        setReports,
        filteredReports,
        setFilteredReports,
        fetchReports,
        fetchAddress,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

// export default ReportContext;
