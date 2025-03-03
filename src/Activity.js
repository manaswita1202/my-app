import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import "./Activity.css";
import { useOutletContext } from "react-router-dom";

const API_URL = "http://localhost:5000/api/activity";

const Activity = () => {
  const [buyer, setBuyer] = useState("");
  const [style, setStyle] = useState("");
  const [description, setDescription] = useState("");
  const [orderQty, setOrderQty] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [tableData, setTableData] = useState([]);
  const { activityData, setActivityData, styleData, setStyleData,activeStyleIndex, setActiveStyleIndex } = useOutletContext(); // Get from Layout

  // Initialize form data from active style
  useEffect(() => {
    if (styleData && activeStyleIndex !== null && styleData[activeStyleIndex]) {
      const activeStyle = styleData[activeStyleIndex];
      
      setBuyer(activeStyle.brand || "");
      setStyle(activeStyle.styleNumber || "");
      setDescription(activeStyle.brand || "");
      setOrderQty(activeStyle.quantity || "");
      setReceivedDate(activeStyle.orderReceivedDate || "");
      
      // Calculate lead time in days
      if (activeStyle.orderReceivedDate && activeStyle.orderDeliveryDate) {
        const startDate = new Date(activeStyle.orderReceivedDate);
        const endDate = new Date(activeStyle.orderDeliveryDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setLeadTime(diffDays.toString());
      }
    }
  }, [styleData, activeStyleIndex]);

  // Default processes for new entries
  const defaultProcesses = [
    { process: "Order Receipt (Buyer PO)", duration: 0, responsibility: "Merchandiser" },
    { process: "CAD Consumption Received", duration: 2, responsibility: "CAD Department" },
    { process: "BOM Generation", duration: 0.5, responsibility: "Merchandiser" },
    { process: "PO Issue for Fabric & Trims", duration: 0.5, responsibility: "Merchandiser" },
    { process: "Fabric Received", duration: 34, responsibility: "Store Manager" },
    { process: "Sample Indent Made", duration: 0.5, responsibility: "Merchandiser" },
    { process: "Pattern Cutting", duration: 0.5, responsibility: "Pattern Master" },
    { process: "Sewing", duration: 4, responsibility: "Production Head" },
    { process: "Embroidery", duration: 0.5, responsibility: "Embroidery Head" },
    { process: "Finishing", duration: 0.5, responsibility: "Production Head" },
    { process: "Packing", duration: 1, responsibility: "Production Head" },
    { process: "Documentation in PLM", duration: 0.5, responsibility: "Production Head" },
    { process: "Dispatch", duration: 0.5, responsibility: "Merchandiser" },
  ];

  // Fetch or create activity data when style changes
  useEffect(() => {
    if (!style) return; // Don't fetch if style is empty
  
    const fetchActivityData = () => {
      axios.get(API_URL, { params: { style } })
        .then(response => {
          setTableData(response.data);
          setActivityData(response.data);
        })
        .catch(error => console.error("Error fetching activity data:", error));
    };
    
    axios.get(API_URL, { params: { style } })
      .then(response => {
        setTableData(response.data);
        setActivityData(response.data);
      })
      .catch(error => {
        if (error.response && error.response.status === 404) {
          // If 404, create new activity entry with default processes
          axios.post(API_URL, { 
            style, 
            buyer, 
            description, 
            orderQty, 
            receivedDate, 
            leadTime, 
            processes: defaultProcesses 
          })
          .then(() => {
            fetchActivityData(); // Fetch newly created data
          })
          .catch(err => console.error("Error creating activity data:", err));
        } else {
          console.error("Error fetching activity data:", error);
        }
      });
  }, [style, buyer, description, orderQty, receivedDate, leadTime]); // Added dependencies

  // Handle Actual Date Changes
  const handleActualDateChange = (id, field, value) => {
    const updatedData = tableData.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        if (updatedRow.actualStart && updatedRow.actualEnd) {
          const actualStart = new Date(updatedRow.actualStart);
          const actualEnd = new Date(updatedRow.actualEnd);
          updatedRow.actualDuration = (actualEnd - actualStart) / (1000 * 60 * 60 * 24);
          updatedRow.delay = Math.max((actualEnd - new Date(updatedRow.plannedEnd)) / (1000 * 60 * 60 * 24), 0);
        }
        
        return updatedRow;
      }
      return row;
    });

    setTableData(updatedData);
    setActivityData(updatedData);

    axios.put(`${API_URL}/${id}`, { [field]: value })
      .catch(err => console.error("Error updating actual date:", err));
  };

  // Export as PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Activity Report", 10, 10);
    doc.autoTable({
      head: [["S No.", "Process", "Duration", "Planned Start", "Planned End", "Actual Start", "Actual End", "Actual Duration", "Delay", "Responsibility"]],
      body: tableData.map((row, index) => [
        index + 1, row.process, row.duration, row.plannedStart, row.plannedEnd,
        row.actualStart, row.actualEnd, row.actualDuration, row.delay, row.responsibility
      ])
    });
    doc.save("activity_report.pdf");
  };

  return (
    <div className="activity-container">
      <h2>Time & Action - Activity</h2>
      <div className="input-container">
        <label>Buyer:</label>
        <input type="text" value={buyer} onChange={(e) => setBuyer(e.target.value)} />

        <label>Style:</label>
        <input type="text" value={style} onChange={(e) => setStyle(e.target.value)} />

        <label>Description:</label>
        <select value={description} onChange={(e) => setDescription(e.target.value)}>
          <option value="Shirt">Shirt</option>
          <option value="Polo T-shirt">Polo T-shirt</option>
          <option value="Shorts">Shorts</option>
          <option value="Trousers">Trousers</option>
        </select>

        <label>Order Quantity:</label>
        <input type="number" value={orderQty} onChange={(e) => setOrderQty(e.target.value)} />

        <label>Received Date:</label>
        <input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />

        <label>Lead Time (Days):</label>
        <input type="number" value={leadTime} onChange={(e) => setLeadTime(e.target.value)} />
      </div>

      <table>
        <thead>
          <tr>
            <th>S No.</th>
            <th>Process</th>
            <th>Duration</th>
            <th>Planned Start</th>
            <th>Planned End</th>
            <th>Actual Start</th>
            <th>Actual End</th>
            <th>Actual Duration</th>
            <th>Delay</th>
            <th>Responsibility</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{row.process}</td>
              <td>{row.duration}</td>
              <td>{row.plannedStart}</td>
              <td>{row.plannedEnd}</td>
              <td><input type="date" value={row.actualStart || ""} onChange={(e) => handleActualDateChange(row.id, "actualStart", e.target.value)} /></td>
              <td><input type="date" value={row.actualEnd || ""} onChange={(e) => handleActualDateChange(row.id, "actualEnd", e.target.value)} /></td>
              <td>{row.actualDuration}</td>
              <td>{row.delay}</td>
              <td>{row.responsibility}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleExportPDF}>Export PDF</button>
    </div>
  );
};

export default Activity;