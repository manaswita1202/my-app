import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import "./OrderCreation.css";

const HomePage = ({ onAddTask }) => {
  const navigate = useNavigate();
  const { styleData, setStyleData,activeStyleIndex, setActiveStyleIndex } = useOutletContext(); // Get from Layout

  // Fetch styles from API when page loads
  useEffect(() => {
    axios.get("http://localhost:5000/styles")
      .then(response => setStyleData(response.data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...styleData];
    updatedRows[index][field] = value;
    setStyleData(updatedRows);
  };

  const handleCheckboxChange = (index) => {
    const updatedRows = [...styleData];
    updatedRows[index].buyerApproval = !updatedRows[index].buyerApproval;
    setStyleData(updatedRows);
  };
  
  const handleLabDipsCheckboxChange = (index) => {
    const updatedRows = [...styleData];
    updatedRows[index].labDipsEnabled = !updatedRows[index].labDipsEnabled;
    setStyleData(updatedRows);
  };

  const addRow = () => {
    setStyleData([...styleData, {
      id: styleData.length + 1, styleNumber: "", brand: "", sampleType: "", garment: "", color: "",
      quantity: "", smv: "", buyerApproval: false, orderReceivedDate: "", orderDeliveryDate: ""
    }]);
  };

  const deleteRow = (index) => {
    const updatedRows = styleData.filter((_, i) => i !== index);
    setStyleData(updatedRows);
    
    // Reset active style if the deleted row was the active one
    if (activeStyleIndex === index) {
      setActiveStyleIndex(null);
    } else if (activeStyleIndex > index) {
      // Adjust activeStyleIndex if a row above the active one was deleted
      setActiveStyleIndex(activeStyleIndex - 1);
    }
  };

  const handleSubmit = (index) => {
    const task = styleData[index];
  
    if (!task.styleNumber || !task.brand || !task.sampleType || !task.garment) {
      alert("Please fill in all required fields!");
      return;
    }
  
    if (task.id) {
      // If ID exists, update the existing entry using PUT
      axios.put(`http://localhost:5000/styles/${task.id}`, task)
        .then(response => {
          alert("Task updated successfully!");
        })
        .catch(error => {
          axios.post("http://localhost:5000/styles", task)
          .then(response => {
            alert("Task added successfully!");
            const updatedRows = [...styleData];
            updatedRows[index].id = response.data.id; // Update ID in local state
            setStyleData(updatedRows);
            onAddTask(task);
          })
          .catch(error => console.error("Error adding task:", error));
        });
    } else {
      // If no ID, create a new entry using POST
      axios.post("http://localhost:5000/styles", task)
        .then(response => {
          alert("Task added successfully!");
          const updatedRows = [...styleData];
          updatedRows[index].id = response.data.id; // Update ID in local state
          setStyleData(updatedRows);
          onAddTask(task);
        })
        .catch(error => console.error("Error adding task:", error));
    }
  };

  // Function to set active style
  const setActiveStyle = (index) => {
    setActiveStyleIndex(index);
    
    // You can also modify the styleData to include an "active" property if needed
    const updatedRows = styleData.map((row, i) => ({
      ...row,
      active: i === index
    }));
    
    setStyleData(updatedRows);
  };
  
  return (
    <div>
      <h2>Sample Order Creation</h2>
      <div className="active-style-container">
        {activeStyleIndex !== null && (
          <div className="active-style-info">
            <h3>Active Style:</h3>
            <p><strong>Style No:</strong> {styleData[activeStyleIndex]?.styleNumber || "N/A"}</p>
            <p><strong>Brand:</strong> {styleData[activeStyleIndex]?.brand || "N/A"}</p>
            <p><strong>Garment:</strong> {styleData[activeStyleIndex]?.garment || "N/A"}</p>
          </div>
        )}
      </div>
      <table border="1" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>S No</th>
            <th>Style No</th>
            <th>Brand</th>
            <th>Sample Type</th>
            <th>Garment</th>
            <th>Colour</th>
            <th>Quantity</th>
            <th>SMV</th>
            <th>Buyer Approval</th>
            <th>Lab Dips</th>
            <th>Order Received Date</th>
            <th>Order Delivery Date</th>
            <th>Active</th>
            <th>Action</th>
            <th>Done</th>
          </tr>
        </thead>
        <tbody>
          {styleData.map((row, index) => (
            <tr key={row.id} className={activeStyleIndex === index ? "active-row" : ""}>
              <td>{index + 1}</td>
              <td><input type="text" value={row.styleNumber} onChange={(e) => handleInputChange(index, "styleNumber", e.target.value)} /></td>
              <td><input type="text" value={row.brand} onChange={(e) => handleInputChange(index, "brand", e.target.value)} /></td>
              <td><input type="text" value={row.sampleType} onChange={(e) => handleInputChange(index, "sampleType", e.target.value)} /></td>
              <td><input type="text" value={row.garment} onChange={(e) => handleInputChange(index, "garment", e.target.value)} /></td>
              <td><input type="text" value={row.color} onChange={(e) => handleInputChange(index, "color", e.target.value)} /></td>
              <td><input type="number" value={row.quantity} onChange={(e) => handleInputChange(index, "quantity", e.target.value)} /></td>
              <td><input type="number" value={row.smv} onChange={(e) => handleInputChange(index, "smv", e.target.value)} /></td>
              <td><input type="checkbox" checked={row.buyerApproval} onChange={() => handleCheckboxChange(index)} /></td>
              <td><input type="checkbox" checked={row.labDipsEnabled} onChange={() => handleLabDipsCheckboxChange(index)} /></td>
              <td><input type="date" value={row.orderReceivedDate} onChange={(e) => handleInputChange(index, "orderReceivedDate", e.target.value)} /></td>
              <td><input type="date" value={row.orderDeliveryDate} onChange={(e) => handleInputChange(index, "orderDeliveryDate", e.target.value)} /></td>
              <td>
                <button 
                  className={`select-btn ${activeStyleIndex === index ? "active-btn" : ""}`}
                  onClick={() => setActiveStyle(index)}
                >
                  {activeStyleIndex === index ? "Selected" : "Select"}
                </button>
              </td>
              <td><button onClick={() => deleteRow(index)}>Delete</button></td>
              <td><button className="done-btn" onClick={() => handleSubmit(index)}>Done</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow}>+ Add Row</button>
      <button className="navigate-btn" onClick={() => navigate("taskboard")}>Go to Task Board</button>
    </div>
  );
};

export default HomePage;