import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import powerbutton from "./assets/powerbutton.png";
import "./Navbar.css";

const Home = ({ onCollapse }) => {
  const [activeTab, setActiveTab] = useState("home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);
  const [isTechpackDropdownOpen, setIsTechpackDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();

  // Notify parent component when collapse state changes
  useEffect(() => {
    if (onCollapse) {
      onCollapse(isCollapsed);
    }
  }, [isCollapsed, onCollapse]);

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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const logout = () => {
    navigate("/login"); // Redirect to Login on logout
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="collapse-button" onClick={toggleCollapse}>
          {isCollapsed ? "→" : "←"}
        </button>
      </div>
      
      <div className="sidebar-content">
        <button
          className={`sidebar-button ${activeTab === "home" ? "active" : ""}`}
          onClick={() => handleNavigation("")}
          title={isCollapsed ? "Home" : ""}
        >
          {isCollapsed ? "🏠" : "Home"}
        </button>
        <button
          className={`sidebar-button ${activeTab === "order-creation" ? "active" : ""}`}
          onClick={() => handleNavigation("order-creation")}
          title={isCollapsed ? "Order Creation" : ""}
        >
          {isCollapsed ? "📝" : "Order Creation"}
        </button>

        <div className="dropdown">
          <button
            className={`sidebar-button ${activeTab === "tna" ? "active" : ""}`}
            onClick={toggleDropdown}
            title={isCollapsed ? "Time and Action" : ""}
          >
            {isCollapsed ? "⏱️" : "Time and Action"}
          </button>
          {isDropdownOpen && !isCollapsed && (
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
        
        {/* Rest of the code remains the same */}
        <div className="dropdown">
          <button
            className={`sidebar-button ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={toggleDashboardDropdown}
            title={isCollapsed ? "Dashboard" : ""}
          >
            {isCollapsed ? "📊" : "Dashboard"}
          </button>
          {isDashboardDropdownOpen && !isCollapsed && (
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
              <button
                className="dropdown-item"
                onClick={() => handleNavigation("performance")}
              >
                Performance Charts
              </button>

            </div>
          )}
        </div>
        
        <div className="dropdown">
          <button 
            className="sidebar-button" 
            onClick={toggleTechpackDropdown}
            title={isCollapsed ? "Techpack" : ""}
          >
            {isCollapsed ? "📋" : "Techpack"}
          </button>
          {isTechpackDropdownOpen && !isCollapsed && (
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

        <button 
          className="sidebar-button" 
          onClick={() => handleNavigation("fabric-trims")}
          title={isCollapsed ? "Repository" : ""}
        >
          {isCollapsed ? "🧵" : "Repository"}
        </button>
        
        <button 
          className="sidebar-button" 
          onClick={() => handleNavigation("style-documents")}
          title={isCollapsed ? "Style Documents" : ""}
        >
          {isCollapsed ? "📄" : "Style Documents"}
        </button>

        <button
          className={`sidebar-button ${activeTab === "sample" ? "active" : ""}`}
          onClick={() => handleNavigation("sample")}
          title={isCollapsed ? "Sample Indent Form" : ""}
        >
          {isCollapsed ? "📑" : "Sample Indent Form"}
        </button>
        
        <button
          className={`sidebar-button ${activeTab === "vendors" ? "active" : ""}`}
          onClick={() => handleNavigation("vendors")}
          title={isCollapsed ? "Vendors" : ""}
        >
          {isCollapsed ? "🏭" : "Vendors"}
        </button>
        
        <button
          className={`sidebar-button ${activeTab === "purchaserequestpage" ? "active" : ""}`}
          onClick={() => handleNavigation("purchaserequestpage")}
          title={isCollapsed ? "Purchase Request" : ""}
        >
          {isCollapsed ? "🛒" : "Purchase Request"}
        </button>
        
        <button
          className={`sidebar-button ${activeTab === "costsheet" ? "active" : ""}`}
          onClick={() => handleNavigation("costsheet")}
          title={isCollapsed ? "Cost Sheet" : ""}
        >
          {isCollapsed ? "💰" : "Cost Sheet"}
        </button>
        
        <button
          className={`sidebar-button ${activeTab === "bom" ? "active" : ""}`}
          onClick={() => handleNavigation("bom")}
          title={isCollapsed ? "BOM" : ""}
        >
          {isCollapsed ? "📦" : "BOM"}
        </button>

        <button
          className={`sidebar-button ${activeTab === "inspirationform" ? "active" : ""}`}
          onClick={() => handleNavigation("inspirationform")}
          title={isCollapsed ? "Inspiration Form" : ""}
        >
          {isCollapsed ? "🎨" : "Inspiration Form"}
        </button>
        
        <button 
          className={`sidebar-button logout-button`}
          onClick={logout}
          title={isCollapsed ? "Logout" : ""}
        >
          {isCollapsed ? (
        <img src={powerbutton} alt="Logout Icon" className="logout-icon" />
       ) : (
      <div className="logout-content">
      <img src={powerbutton} alt="Logout Icon" className="logout-icon" />
      <span className="logout-text">Logout</span>
    </div>
    )}
    </button>
      </div>
    </div>
  );
};

export default Home;