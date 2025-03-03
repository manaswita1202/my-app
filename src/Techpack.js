import "./Techpack.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import hugoBossLogo from "./assets/hugo-boss.png";
import usPoloLogo from "./assets/us-polo.png";
import arrowLogo from "./assets/arrow.png";
import deleteIcon from "./assets/delete.png";

const Techpack = () => {
  const [buyers, setBuyers] = useState([
    { name: "Hugo Boss", logo: hugoBossLogo },
    { name: "US Polo", logo: usPoloLogo },
    { name: "Arrow", logo: arrowLogo },
  ]);

  
  const navigate = useNavigate();

  const addMoreBuyer = () => {
    const newBuyer = prompt("Enter Buyer Name:");
    if (newBuyer && !buyers.some((buyer) => buyer.name === newBuyer)) {
      setBuyers([...buyers, { name: newBuyer, logo: "" }]);
    }
  };

  const deleteBuyer = (buyerName) => {
    setBuyers(buyers.filter((buyer) => buyer.name !== buyerName));
  };

  return (
    <div className="techpack-container">
      <h2 className="techpack-title">Techpack & Specsheet</h2>
      <button className="back-button" onClick={() => navigate("/dashboard")}>
        Back
      </button>

      {buyers.map((buyer, index) => (
        <div key={index} className="buyer-card">
          <div className="buyer-info">
            {buyer.logo && <img src={buyer.logo} alt={`${buyer.name} logo`} className="buyer-logo" />}
            <h3 className="buyer-name">{buyer.name}</h3>
          </div>

          <div className="buyer-actions">
            <button className="open-button" onClick={() => navigate(`/dashboard/techpack/${buyer.name}`)}>
              Open
            </button>
            <img
              src={deleteIcon}
              alt="Delete"
              className="delete-icon"
              onClick={() => deleteBuyer(buyer.name)}
            />
          </div>
        </div>
      ))}

      <button className="add-more-btn" onClick={addMoreBuyer}>
        + Add More
      </button>
    </div>
  );
};

export default Techpack;
