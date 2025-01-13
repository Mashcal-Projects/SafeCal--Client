import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useReport } from "../context/ReportContext";
import { useAuth } from "../context/AuthContext";
import { ReportComp } from "../components/Report";
import {
  DatePicker,
  ConfigProvider,
  Input,
  Button,
  Dropdown,
  Select,
} from "antd";
import heIL from "antd/lib/locale/he_IL";
import dayjs from "dayjs";
import "dayjs/locale/he";
import isBetween from "dayjs/plugin/isBetween";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import "../styling/reports.scss";

dayjs.locale("he");
dayjs.extend(isBetween);

export const ReportsComp = () => {
  const { reports, filteredReports, setFilteredReports, fetchReports } =
    useReport();
  const { isLoggedIn, user } = useAuth();
  const currentLanguage = i18n.language;

  const { RangePicker } = DatePicker;
  const { t } = useTranslation(["report", "dashboard", "login"]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [tableWidth, setTableWidth] = useState("auto");
  const tableRef = useRef(null);

  useEffect(() => {
     console.log("$$$")
    if (tableRef.current) {
       console.log("tableRef.current",tableRef.current)
      // Get the table width based on the content on initial render
      // const width = tableRef.current.offsetWidth;
      const width = 560;
      setTableWidth(`${width}px`); // Lock the width
    }
    fetchReports();
  }, []);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  const handleDateChange = (dates) => {
    setDateRange(dates);
  };
  const handleStatusChange = (value) => {
    setStatus(value); // Assuming you have a `status` state
  };

  const handleApplyFilter = () => {
    let filtered = reports;

    // Apply search filter by address
    if (searchValue.trim() !== "") {
      filtered = filtered.filter((report) => {
        // return report.location.startsWith(searchValue);
        return report.location.includes(searchValue);
      });
    }
    // Apply date filter
    if (dateRange) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.dateTime);
        return (
          reportDate >= dateRange[0].toDate() &&
          reportDate <= dateRange[1].toDate()
        );
      });
    }

    // Apply keyword filter using the standalone function
    filtered = filterByKeyword(filtered, keyword);

    // Apply status filter (only if a status is selected)
    if (status != null) {
      console.log("status", status);
      filtered = filtered.filter((report) => report.status === status);
    }
    console.log("filtered", filtered);
    // Update filtered reports
    setFilteredReports(filtered);
    // Close the dropdown
    setFilterOpen(false);
  };
  const filterByKeyword = (reports, keyword) => {
    if (keyword.trim() === "") return reports; // If no keyword, return all reports

    return reports.filter(
      (report) =>
        report.location.includes(keyword) || // Check location
        report.value.includes(keyword) // Check report name
    );
  };

  const handleReset = () => {
    setFilteredReports(reports);
  };

  const menu = (
    <div className="menu-wrapper">
      <div className="inner-wrapper" style={{ marginBottom: "10px" }}>
        <p>{t("select_date")}</p>
        <RangePicker
          style={{ borderRadius: "18px" }}
          onChange={handleDateChange}
          showTime={{
            format: "HH:mm",
          }}
        />
        <p>{t("address")}</p>
        <Input
          onChange={handleSearchChange}
          value={searchValue}
          placeholder={t("address_filter")}
        />
        <p>{t("key_word")}</p>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t("additional_filter")}
        />
        {user && user.role.toLowerCase() === "admin" && (
          <div>
            <p>{t("status")}</p>
            <Select
              className="custom-select"
              style={{ width: "100%", borderRadius: "18px" }}
              onChange={handleStatusChange}
              // placeholder={t("status_filter")}
            >
              <Select.Option value={true}>{t("handled")}</Select.Option>
              <Select.Option value={false}>{t("not_handled")}</Select.Option>
            </Select>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          <Button
            className="primary-button"
            type="primary"
            onClick={handleApplyFilter}
          >
            {t("apply")}
          </Button>
          <Button className="primary-button" onClick={handleReset}>
            {t("reset")}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="reports">
      {isLoggedIn && (
        <div className="filter-search-container">
          <ConfigProvider locale={heIL} direction="rtl">
            {/* Filter Button with Dropdown */}
            <Dropdown
              menu={{ items: [] }}
              dropdownRender={() => menu}
              trigger={["click"]}
              open={filterOpen}
              onOpenChange={(open) => setFilterOpen(open)}
            >
              <Button
                icon={<FilterOutlined />}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: "0.5",
                  borderRadius: "18px",
                }}
              >
                {currentLanguage === "he" ? "סינון" : "Filters"}
              </Button>
            </Dropdown>
            {/* Search Input */}
            <Input
              placeholder={
                currentLanguage === "he" ? "חפש אירוע" : "Search for Address"
              }
              prefix={<SearchOutlined />}
              onChange={(e) => {
                const value = e.target.value;
                setKeyword(value);
                const filtered = filterByKeyword(reports, value); // Filter reports
                setFilteredReports(filtered); // Update the filtered list
              }}
              style={{ flex: "1.5", borderRadius: "18px" }}
            />
          </ConfigProvider>
        </div>
      )}

      <div className="tbody-scroll">
        <table
          ref={tableRef}
          // style={{ width: tableWidth }} // Set the locked width here
        >
          <thead>
            <tr className="report-line">
              <th>{t("address")}</th>
              <th>{t("report")}</th>
              <th>{t("date")}</th>
              {user && user.role.toLowerCase() === "admin" && (
                <th>{t("status")}</th>
              )}
            </tr>
          </thead>
          <tbody style={{ width: tableWidth }}>
            {filteredReports && filteredReports.length > 0 ? (
              (user?.role.toLowerCase() === "admin"
                ? filteredReports
                : filteredReports.filter((report) => report.status === false)
              ).map((report) => (
                <ReportComp
                  key={report._id || `${report.latitude}-${report.longitude}`}
                  report={report}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={user && user.role.toLowerCase() === "admin" ? 4 : 3}
                  style={{ textAlign: "center" }}
                >
                  No reports found for the selected date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
