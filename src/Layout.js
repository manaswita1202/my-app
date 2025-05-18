import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import Chatbot from "./Chatbot";

const Layout = () => {
  const [styleData, setStyleData] = useState([]);
  const [activeStyleIndex, setActiveStyleIndex] = useState(null);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);

  const processData = [
    { id: 1, process: "Order Receipt (Buyer PO)", duration: 0, responsibility: "Merchandiser" },
    { id: 2, process: "CAD Consumption Received", duration: 2, responsibility: "CAD Department" },
    { id: 3, process: "BOM Generation", duration: 0.5, responsibility: "Merchandiser" },
    { id: 4, process: "PO Issue for Fabric & Trims", duration: 0.5, responsibility: "Merchandiser" },
    { id: 5, process: "Fabric Received", duration: 34, responsibility: "Store Manager" },
    { id: 6, process: "Sample Indent Made", duration: 0.5, responsibility: "Merchandiser" },
    { id: 7, process: "Pattern Cutting", duration: 0.5, responsibility: "Pattern Master" },
    { id: 8, process: "Sewing", duration: 4, responsibility: "Production Head" },
    { id: 9, process: "Embroidery", duration: 0.5, responsibility: "Embroidery Head" },
    { id: 10, process: "Finishing", duration: 0.5, responsibility: "Production Head" },
    { id: 11, process: "Packing", duration: 1, responsibility: "Production Head" },
    { id: 12, process: "Documentation in PLM", duration: 0.5, responsibility: "Production Head" },
    { id: 13, process: "Dispatch", duration: 0.5, responsibility: "Merchandiser" },
  ];

  const [activityData, setActivityData] = useState(processData.map(row => ({
    ...row,
    plannedStart: "",
    plannedEnd: "",
    actualStart: "",
    actualEnd: "",
    actualDuration: "",
    delay: ""
  })));

  // Handle navbar collapse state changes
  const handleNavbarCollapse = (collapsed) => {
    setIsNavbarCollapsed(collapsed);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Fixed Sidebar/Navbar */}
      <div 
        style={{ 
          background: "#fff", 
          borderRight: "1px solid #ccc", 
          position: "fixed", 
          height: "100vh", 
          overflow: "auto",
          width: isNavbarCollapsed ? "60px" : "250px",
          transition: "width 0.3s ease"
        }}
      >
        <Navbar onCollapse={handleNavbarCollapse} /> {/* Pass the collapse handler to Navbar */}
      </div>

      {/* Page Content (Renders beside navbar) */}
      <div 
        style={{ 
          marginLeft: isNavbarCollapsed ? "60px" : "250px", 
          flex: 1,
          transition: "margin-left 0.3s ease"
        }}
      >
        {/* Header Component */}
        <Header onLogout={() => console.log("Logged Out!")} />

        {/* Page Content */}
        <div style={{ padding: "10px" }} className="page-content">
          <Outlet 
            context={{ 
              activityData, 
              setActivityData, 
              styleData, 
              setStyleData, 
              activeStyleIndex, 
              setActiveStyleIndex 
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;