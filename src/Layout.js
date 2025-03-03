import React, {useState} from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; // Import your Navbar component
import Header from "./Header";

const Layout = () => {
  const [styleData, setStyleData] = useState([]); 
  const [activeStyleIndex, setActiveStyleIndex] = useState(null); // Store style info
  // Store style info


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
  }))); // Store activity data here

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Fixed Sidebar/Navbar */}
      <div style={{ width: "250px", background: "#fff", borderRight: "1px solid #ccc", position: "fixed", height: "100vh" }}>
        <Navbar /> {/* Your existing navbar component */}
      </div>

      {/* Page Content (Renders beside navbar) */}
      <div style={{ marginLeft: "250px", flex: 1 }}>
        {/* Header Component */}
        <Header onLogout={() => console.log("Logged Out!")} />

        {/* Page Content */}
        <div style={{padding : "10px"}} className="page-content">
          <Outlet context={{ activityData, setActivityData, styleData, setStyleData,activeStyleIndex, setActiveStyleIndex }} />
        </div>
      </div>
    </div>

  );
};

export default Layout;
