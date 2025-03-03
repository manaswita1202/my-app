import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import samplifylogo from "./assets/samplifylogo.png";
import "./Navbar.css";

const Home = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);
  const [isTechpackDropdownOpen, setIsTechpackDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    navigate(`/dashboard/${tab}`);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const toggleDashboardDropdown = () => {
    setIsDashboardDropdownOpen(!isDashboardDropdownOpen);
  };

  const toggleTechpackDropdown = () => {
    setIsTechpackDropdownOpen(!isTechpackDropdownOpen);
  };

  const logout = () => {
    navigate("/login"); // Redirect to Login on logout
  };

  return (
    <div className="sidebar-logo">
  <img src={samplifylogo} alt="Samplify Logo" className="sidebar-logo" />
  
      <button
        className={`sidebar-button ${activeTab === "home" ? "active" : ""}`}
        onClick={() => handleNavigation("")}
      >
        Home
      </button>
      <button
        className={`sidebar-button ${activeTab === "order-creation" ? "active" : ""}`}
        onClick={() => handleNavigation("order-creation")}
      >
        Order Creation
      </button>

      <div className="dropdown">
        <button
          className={`sidebar-button ${activeTab === "tna" ? "active" : ""}`}
          onClick={toggleDropdown}
        >
          Time and Action
        </button>
        {isDropdownOpen && (
          <div className="dropdown-content">
            <button
              className="dropdown-item"
              onClick={() => handleNavigation("tna/activity")}
            >
              Activity
            </button>
            <button
              className="dropdown-item"
              onClick={() => handleNavigation("tna/gantt-chart")}
            >
              Gantt Chart
            </button>
            <button
              className="dropdown-item"
              onClick={() => handleNavigation("tna/calendar-to-do")}
            >
              Calendar-To do
            </button>
          </div>
        )}
      </div>
      <div className="dropdown">
        <button
          className={`sidebar-button ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={toggleDashboardDropdown}
        >
          Dashboard
        </button>
        {isDashboardDropdownOpen && (
          <div className="dropdown-content">
            <button
              className="dropdown-item"
              onClick={() => handleNavigation("taskboard")}
            >
              Production progress
            </button>
            <button
              className="dropdown-item"
              onClick={() => handleNavigation("sample-tracker")}
            >
              Sample Tracking
            </button>
            <button
              className="dropdown-item"
              onClick={() => handleNavigation("order-tracker")}
            >
              Order Tracking
            </button>
          </div>
        )}
      </div>
      <div className="dropdown">
        <button className="sidebar-button" onClick={toggleTechpackDropdown}
        >
          Techpack
        </button>
        {isTechpackDropdownOpen && (
          <div className="dropdown-content">
            <button className="dropdown-item" onClick={() => handleNavigation("techpack/upload")}>
              Upload
            </button>
            <button className="dropdown-item" onClick={() => handleNavigation("techpack/generate")}>
              Generate
            </button>
          </div>
        )}
      </div>

      <button className="sidebar-button" onClick={() => handleNavigation("fabric-trims")}
      >
        Trims
      </button>
      <button className="sidebar-button" onClick={() => handleNavigation("style-documents")}
      >
        Style Documents
      </button>

      <button
        className={`sidebar-button ${activeTab === "sample" ? "active" : ""}`}
        onClick={() => handleNavigation("sample")}
      >
        Sample Indent Form
      </button>
      <button
        className={`sidebar-button ${activeTab === "vendors" ? "active" : ""}`}
        onClick={() => handleNavigation("vendors")}
      >
        Vendors
      </button>
      <button
        className={`sidebar-button ${activeTab === "purchase" ? "active" : ""}`}
        onClick={() => handleNavigation("purchase")}
      >
        Purchase Request
      </button>
      <button
        className={`sidebar-button ${activeTab === "costsheet" ? "active" : ""}`}
        onClick={() => handleNavigation("costsheet")}
      >
        Cost Sheet
      </button>
      <button
        className={`sidebar-button ${activeTab === "bom" ? "active" : ""}`}
        onClick={() => handleNavigation("bom")}
      >
        BOM
      </button>
      <button className="sidebar-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Home;
