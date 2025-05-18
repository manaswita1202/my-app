import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import "./Activity.css"; // Ensure this path is correct
import { useOutletContext } from "react-router-dom";

const API_URL = "https://samplify-backend-production.up.railway.app/api/activity";

// Helper function to format date strings to YYYY-MM-DD for date inputs
const formatDateForInput = (dateString) => {
  if (!dateString) return ""; // Return empty string if null, undefined, or empty
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        // Handle cases where dateString might already be in YYYY-MM-DD or is otherwise unparsable by new Date()
        // A more robust check might be needed if various invalid formats are common
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString; // Already in correct format
        }
        console.warn("Invalid date string encountered for formatting:", dateString);
        return ""; // Return empty for invalid dates
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return ""; // Fallback
  }
};

const Activity = () => {
  const [buyer, setBuyer] = useState("");
  const [style, setStyle] = useState("");
  const [description, setDescription] = useState("");
  const [orderQty, setOrderQty] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [tableData, setTableData] = useState([]);
  // Assuming activeStyleIndex is a number (index) and styleData is an array from context
  const { activityData, setActivityData, styleData, setStyleData, activeStyleIndex, setActiveStyleIndex } = useOutletContext();

  // Initialize form data from active style
  useEffect(() => {
    if (styleData && activeStyleIndex !== null && styleData[activeStyleIndex]) {
      const activeStyle = styleData[activeStyleIndex];
      
      setBuyer(activeStyle.brand || "");
      setStyle(activeStyle.styleNumber || "");
      setDescription(activeStyle.brand || ""); // Or activeStyle.garment as per your data structure
      setOrderQty(activeStyle.quantity || "");
      // ORIGINAL: Do not format receivedDate here for the input, assuming API sends compatible format or it's handled by input type="date"
      setReceivedDate(activeStyle.orderReceivedDate || ""); 
      
      if (activeStyle.orderReceivedDate && activeStyle.orderDeliveryDate) {
        const startDate = new Date(activeStyle.orderReceivedDate);
        const endDate = new Date(activeStyle.orderDeliveryDate);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setLeadTime(diffDays.toString());
        } else {
            setLeadTime("");
        }
      } else {
        setLeadTime("");
      }
    } else {
      // Clear fields if no active style
      setBuyer("");
      setStyle("");
      setDescription("");
      setOrderQty("");
      setReceivedDate("");
      setLeadTime("");
    }
  }, [styleData, activeStyleIndex]); // Original dependencies

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
    if (!style) {
        setTableData([]); // Clear table if no style
        if (setActivityData) setActivityData([]); // Clear context data as well
        return;
    }
  
    const fetchAndProcessActivityData = (isRetryAfterCreate = false) => {
      axios.get(API_URL, { params: { style } })
        .then(response => {
          const formattedData = response.data.map(row => ({
            ...row,
            // MODIFIED: Only format actualStart and actualEnd for date input display
            actualStart: formatDateForInput(row.actualStart),
            actualEnd: formatDateForInput(row.actualEnd),
            // plannedStart and plannedEnd are kept as is from API for now
            // If they also need formatting for display, apply formatDateForInput here too.
          }));
          setTableData(formattedData);
          if (setActivityData) { // Update context
            setActivityData(formattedData); // Send the same formatted data to context
          }
        })
        .catch(error => {
          if (!isRetryAfterCreate && error.response && error.response.status === 404) {
            // If 404 and not a retry, create new activity entry
            axios.post(API_URL, { 
              style, 
              buyer, 
              description, 
              orderQty, 
              receivedDate, // Send date as is; backend should handle parsing
              leadTime, 
              processes: defaultProcesses 
            })
            .then(() => {
              fetchAndProcessActivityData(true); // Fetch newly created data
            })
            .catch(err => console.error("Error creating activity data:", err));
          } else {
            console.error("Error fetching activity data:", error);
            setTableData([]);
            if (setActivityData) setActivityData([]);
          }
        });
    };
    
    fetchAndProcessActivityData();

  }, [style, buyer, description, orderQty, receivedDate, leadTime, setActivityData]); // Original dependencies + setActivityData (if it's stable)

  // Handle Actual Date Changes
  const handleActualDateChange = (id, field, value) => { // value is YYYY-MM-DD from input
    const updatedData = tableData.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        // Recalculate actualDuration and delay
        if (updatedRow.actualStart && updatedRow.actualEnd) {
          const actualStart = new Date(updatedRow.actualStart); // YYYY-MM-DD is fine for new Date()
          const actualEnd = new Date(updatedRow.actualEnd);
          if (!isNaN(actualStart.getTime()) && !isNaN(actualEnd.getTime())) {
            updatedRow.actualDuration = (actualEnd - actualStart) / (1000 * 60 * 60 * 24); // Duration in days
            
            if (updatedRow.plannedEnd) { // Ensure plannedEnd exists and is valid
                const plannedEnd = new Date(updatedRow.plannedEnd); // This might be unformatted from API
                if (!isNaN(plannedEnd.getTime())) {
                    updatedRow.delay = Math.max(0, (actualEnd - plannedEnd) / (1000 * 60 * 60 * 24)); // Delay in days
                } else {
                    updatedRow.delay = null; 
                }
            } else {
                updatedRow.delay = null;
            }
          } else {
            updatedRow.actualDuration = null; 
            updatedRow.delay = null; 
          }
        } else {
            updatedRow.actualDuration = null;
            if (!updatedRow.actualEnd && updatedRow.plannedEnd) { 
                updatedRow.delay = null;
            }
        }
        return updatedRow;
      }
      return row;
    });

    setTableData(updatedData);
    if (setActivityData) {
        setActivityData(updatedData); // Update context
    }

    // Persist the change to the backend
    axios.put(`${API_URL}/${id}`, { [field]: value }) // Send YYYY-MM-DD string
      .catch(err => {
          console.error("Error updating actual date:", err);
          // Optionally revert UI state if API call fails
      });
  };

  // Export as PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Activity Report", 10, 10);
    doc.autoTable({
      head: [["S No.", "Process", "Duration", "Planned Start", "Planned End", "Actual Start", "Actual End", "Actual Duration", "Delay", "Responsibility"]],
      body: tableData.map((row, index) => [
        index + 1, 
        row.process, 
        row.duration, 
        row.plannedStart, // This will be as per API or formatted if you choose to
        row.plannedEnd,   // This will be as per API or formatted if you choose to
        row.actualStart,  // This is formatted for YYYY-MM-DD
        row.actualEnd,    // This is formatted for YYYY-MM-DD
        row.actualDuration !== null && row.actualDuration !== undefined ? row.actualDuration : "", // Original display
        row.delay !== null && row.delay !== undefined ? row.delay : "", // Original display
        row.responsibility
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
          <option value="">Select Description</option>
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
        <input type="number" value={leadTime} onChange={(e) => setLeadTime(e.target.value)} /> {/* Reverted readOnly */}
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
          {/* Ensure row.id is a unique and stable identifier if possible, otherwise index is a fallback */}
          {tableData.map((row, index) => (
            <tr key={row.id || index}> {/* Prefer row.id if available and unique */}
              <td>{index + 1}</td>
              <td>{row.process}</td>
              <td>{row.duration}</td>
              <td>{row.plannedStart}</td> {/* Display as is from (potentially formatted) tableData */}
              <td>{row.plannedEnd}</td>   {/* Display as is from (potentially formatted) tableData */}
              {/* Value for date inputs should be YYYY-MM-DD */}
              <td><input type="date" value={row.actualStart || ""} onChange={(e) => handleActualDateChange(row.id, "actualStart", e.target.value)} /></td>
              <td><input type="date" value={row.actualEnd || ""} onChange={(e) => handleActualDateChange(row.id, "actualEnd", e.target.value)} /></td>
              <td>{row.actualDuration}</td> {/* Reverted .toFixed() */}
              <td>{row.delay}</td>        {/* Reverted .toFixed() */}
              <td>{row.responsibility}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleExportPDF} className="export-pdf-button">Export PDF</button>
    </div>
  );
};

export default Activity;