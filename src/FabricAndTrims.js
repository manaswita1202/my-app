import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FabricAndTrims.css";

import others from "./assets/others.png"; // Default image

const FabricAndTrims = () => {
  const [fabrics, setFabrics] = useState([]);
  const [trims, setTrims] = useState([]);
  const [activeTab, setActiveTab] = useState("fabrics");
  const navigate = useNavigate();

  // Fetch fabrics and trims from API
  useEffect(() => {
    fetchFabrics();
    fetchTrims();
  }, []);

  const fetchFabrics = async () => {
    try {
      const response = await fetch("https://samplify-backend-production.up.railway.app/api/fabrics");
      const data = await response.json();
      setFabrics(data);
    } catch (error) {
      console.error("Error fetching fabrics:", error);
    }
  };

  const fetchTrims = async () => {
    try {
      const response = await fetch("https://samplify-backend-production.up.railway.app/api/trims");
      const data = await response.json();
      setTrims(data);
    } catch (error) {
      console.error("Error fetching trims:", error);
    }
  };

  // Add new fabric
  const addMoreFabric = async () => {
    const newFabric = prompt("Enter the Fabric:");
    if (newFabric && !fabrics.some((fabric) => fabric.name === newFabric)) {
      const fabricData = { name: newFabric, image: others };

      try {
        const response = await fetch("https://samplify-backend-production.up.railway.app/api/fabrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fabricData),
        });

        if (response.ok) {
          setFabrics([...fabrics, fabricData]); // Update UI
        }
      } catch (error) {
        console.error("Error adding fabric:", error);
      }
    }
  };

  // Delete fabric
  const deleteFabric = async (fabricName) => {
    if (!window.confirm(`Are you sure you want to delete ${fabricName}?`)) return;

    try {
      const response = await fetch(`https://samplify-backend-production.up.railway.app/api/fabrics/${fabricName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFabrics(fabrics.filter((fabric) => fabric.name !== fabricName));
      }
    } catch (error) {
      console.error("Error deleting fabric:", error);
    }
  };

  // Add new trim
  const addMoreTrim = async () => {
    const newTrim = prompt("Enter the Trim:");
    if (newTrim && !trims.some((trim) => trim.name === newTrim)) {
      const trimData = { name: newTrim, image: others };

      try {
        const response = await fetch("https://samplify-backend-production.up.railway.app/api/trims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trimData),
        });

        if (response.ok) {
          setTrims([...trims, trimData]); // Update UI
        }
      } catch (error) {
        console.error("Error adding trim:", error);
      }
    }
  };

  // Delete trim
  const deleteTrim = async (trimName) => {
    if (!window.confirm(`Are you sure you want to delete ${trimName}?`)) return;

    try {
      const response = await fetch(`https://samplify-backend-production.up.railway.app/api/trims/${trimName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTrims(trims.filter((trim) => trim.name !== trimName));
      }
    } catch (error) {
      console.error("Error deleting trim:", error);
    }
  };

  return (
    <div className="fabric-trims-container">
      <h2>Fabrics & Trims</h2>
      {/* <button className="back-button" onClick={() => navigate("/dashboard")}>
        Back
      </button> */}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === "fabrics" ? "active" : ""}`}
          onClick={() => setActiveTab("fabrics")}
        >
          Fabrics
        </button>
        <button 
          className={`tab-button ${activeTab === "trims" ? "active" : ""}`}
          onClick={() => setActiveTab("trims")}
        >
          Trims
        </button>
      </div>

      <div className="content-section">
        {/* Fabrics Section */}
        {activeTab === "fabrics" && (
          <div className="items-section">
            <h3>Fabrics</h3>
            <div className="items-grid">
              {fabrics.map((fabric) => (
                <div key={fabric.name} className="item-card">
                  <Link to={`/dashboard/fabric/${fabric.name}`} className="item-link">
                    <img src={fabric.image || others} alt={fabric.name} />
                    <p>{fabric.name}</p>
                  </Link>
                  <button 
                    className="delete-btn" 
                    onClick={() => deleteFabric(fabric.name)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <button className="add-more-btn" onClick={addMoreFabric}>
              + Add More Fabrics
            </button>
          </div>
        )}

        {/* Trims Section */}
        {activeTab === "trims" && (
          <div className="items-section">
            <h3>Trims</h3>
            <div className="items-grid">
              {trims.map((trim) => (
                <div key={trim.name} className="item-card">
                  <Link to={`/dashboard/trim/${trim.name}`} className="item-link">
                    <img src={trim.image || others} alt={trim.name} />
                    <p>{trim.name}</p>
                  </Link>
                  <button 
                    className="delete-btn" 
                    onClick={() => deleteTrim(trim.name)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <button className="add-more-btn" onClick={addMoreTrim}>
              + Add More Trims
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FabricAndTrims;