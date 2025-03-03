import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FabricAndTrims.css";

import others from "./assets/others.png"; // Default image

const FabricAndTrims = () => {
  const [trims, setTrims] = useState([]);
  const navigate = useNavigate();

  // Fetch trims from API
  useEffect(() => {
    const fetchTrims = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trims");
        const data = await response.json();
        setTrims(data);
      } catch (error) {
        console.error("Error fetching trims:", error);
      }
    };
    fetchTrims();
  }, []);

  // Add new trim
  const addMoreTrim = async () => {
    const newTrim = prompt("Enter the Trim:");
    if (newTrim && !trims.some((trim) => trim.name === newTrim)) {
      const trimData = { name: newTrim, image: others };

      try {
        const response = await fetch("http://localhost:5000/api/trims", {
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
    try {
      const response = await fetch(`http://localhost:5000/api/trims/${trimName}`, {
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
      <h2>Trims</h2>
      <button className="back-button" onClick={() => navigate("/dashboard")}>Back</button>
      <div className="fabric-trims-section">
        <div className="trim-section">
          <h3>Trims</h3>
          <div className="trims-grid">
            {trims.map((trim) => (
              <div key={trim.name} className="trim-card">
                <Link to={`/dashboard/trim/${trim.name}`}>
                  <img src={trim.image || others} alt={trim.name} />
                  <p>{trim.name}</p>
                </Link>
                <button className="delete-btn" onClick={() => deleteTrim(trim.name)}>Delete</button>
              </div>
            ))}
          </div>
          <button className="add-more-btn" onClick={addMoreTrim}>+ Add More</button>
        </div>
      </div>
    </div>
  );
};

export default FabricAndTrims;
