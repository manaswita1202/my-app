import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FabricDetail.css";
import fabricData from "./fabricData"; // A separate data file for fabric details

const FabricDetail = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const currentFabric = currentPath.split("/").pop();
  // Load fabrics from localStorage or fallback to initial fabricData
  const [fabrics, setFabrics] = useState(() => {
    
    const savedFabrics = localStorage.getItem(currentFabric);
    return savedFabrics ? JSON.parse(savedFabrics) : [];
  });

  // Save updates to localStorage whenever fabrics state changes
  useEffect(() => {
    localStorage.setItem(currentFabric  , JSON.stringify(fabrics));
  }, [fabrics]);

  // Function to add a new fabric
  const addMoreFabric = () => {
    const name = prompt("Enter Fabric Name:");
    if (!name) return;

    const image = prompt("Enter Fabric Image URL (or leave blank):") || "";
    const composition = prompt("Enter Fabric Composition:");
    const structure = prompt("Enter Fabric Structure:");
    const shade = prompt("Enter Fabric Shade:");
    const brand = prompt("Enter Fabric Brand:");

    const newFabric = { name, image, composition, structure, shade, brand };
    const updatedFabrics = [...fabrics, newFabric];

    setFabrics(updatedFabrics);
    localStorage.setItem("fabrics", JSON.stringify(updatedFabrics));
  };

  return (
    <div className="detail-container">
      <h2>Fabric List</h2>
      <div className="fabric-list">
        {fabrics.map((fabric, index) => (
          <div key={index} className="detail-card">
            <img src={fabric.image} alt={fabric.name} />
            <div className="detail-info">
              <h3>{fabric.name}</h3>
              <p><strong>Composition:</strong> {fabric.composition}</p>
              <p><strong>Structure:</strong> {fabric.structure}</p>
              <p><strong>Shade:</strong> {fabric.shade}</p>
              <p><strong>Brand:</strong> {fabric.brand}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="add-more-btn" onClick={addMoreFabric}>
        + Add More
      </button>
    </div>
  );
};

export default FabricDetail;
