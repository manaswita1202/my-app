import { useState, useEffect } from "react";
import "./ApprovalStatus.css";
import LabDips from "./LabDips";

const SampleApprovalDashboard = () => {
    const [samples, setSamples] = useState({ received: [], pending: [], yetToSend: [], rejected : [] });

    // Fetch samples from backend
    useEffect(() => {
      const fetchSamples = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/approval-status");
          if (!response.ok) throw new Error("Failed to fetch samples");
  
          const data = await response.json();
          setSamples(data);  // Update state with categorized samples
        } catch (error) {
          console.error("Error fetching samples:", error);
        }
      };
  
      fetchSamples();
    }, []);
  
    const moveSample = async (id, from, to) => {
    const item = samples[from].find((sample) => sample.id === id);
    if (!item) return;
    try {
        const response = await fetch("http://localhost:5000/api/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, approvalStatus: to }),
        });
  
        if (!response.ok) throw new Error("Failed to update");
  
        // Update state after successful API call
        setSamples((prevSamples) => ({
          ...prevSamples,
          [from]: prevSamples[from].filter((sample) => sample.id !== id),
          [to]: [...prevSamples[to], { ...item, approvalStatus: to }],
        }));
      } catch (error) {
        console.error("Error updating status:", error);
      }
  };

  const renderSamples = (category, title, className) => (
    <div className={`section ${className}`}>
      <h2>{title}</h2>
      {samples[category].map((sample) => (
        <div key={sample.id} className="card">
          <p><strong>Style #:</strong> {sample.style}</p>
          <p>👤 <strong>Buyer:</strong> {sample.buyer}</p>
          <p>👕 <strong>Garment:</strong> {sample.garment}</p>
          {sample.date && <p>📅 <strong>Date:</strong> {sample.date}</p>}
          <div className="button-container">
            {category === "pending" && (
              <button className="approve" onClick={() => moveSample(sample.id, "pending", "received", "sample")}>Approve ✅</button>
            )}
            {category === "yetToSend" && (
              <button className="send" onClick={() => moveSample(sample.id, "yetToSend", "pending", "sample")}>Send for Approval 📤</button>
            )}
                {category === "pending" && (
              <button className="approve" onClick={() => moveSample(sample.id, "pending", "rejected", "sample")}>Reject ❌</button>
            )}

          </div>
        </div>
      ))}
    </div>
  );


  return (
    <div>
      <h1 className="title">Sample Approval</h1>
      <div className="dashboard">
        {renderSamples("received", "Approvals Received", "received")}
        {renderSamples("pending", "Pending Approvals", "pending")}
        {renderSamples("yetToSend", "Yet to be Sent", "yetToSend")}
        {renderSamples("rejected", "Rejected", "rejected")}
      </div>
      <LabDips />
      </div>
  );
};

export default SampleApprovalDashboard;

/*import { useState, useEffect } from "react";
import "./ApprovalStatus.css";

const SampleApprovalDashboard = () => {
  const [samples, setSamples] = useState({ received: [], pending: [], yetToSend: [] });

  // Fetch samples from backend
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/approval-status");
        if (!response.ok) throw new Error("Failed to fetch samples");

        const data = await response.json();
        setSamples(data);  // Update state with categorized samples
      } catch (error) {
        console.error("Error fetching samples:", error);
      }
    };

    fetchSamples();
  }, []);

  // Move sample between categories
  const moveSample = async (id, from, to) => {
    const item = samples[from].find((sample) => sample.id === id);
    if (!item) return;

    try {
      const response = await fetch("http://localhost:5000/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approvalStatus: to }),
      });

      if (!response.ok) throw new Error("Failed to update");

      // Update state after successful API call
      setSamples((prevSamples) => ({
        ...prevSamples,
        [from]: prevSamples[from].filter((sample) => sample.id !== id),
        [to]: [...prevSamples[to], { ...item, approvalStatus: to }],
      }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Render samples in categories
  const renderSamples = (category, title, className) => (
    <div className={`section ${className}`}>
      <h2>{title}</h2>
      {samples[category].map((sample) => (
        <div key={sample.id} className="card">
          <p><strong>Style :</strong> {sample.style}</p>
          <p>👤 <strong>Buyer:</strong> {sample.buyer}</p>
          <p>👕 <strong>Garment:</strong> {sample.garment}</p>
          {sample.date && <p>📅 <strong>Date:</strong> {sample.date}</p>}
          <div className="button-container">
            {category === "pending" && (
              <button className="approve" onClick={() => moveSample(sample.id, "pending", "received")}>
                Approve ✅
              </button>
            )}
            {category === "yetToSend" && (
              <button className="send" onClick={() => moveSample(sample.id, "yetToSend", "pending")}>
                Send for Approval 📤
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="dashboard">
      {renderSamples("received", "Approvals Received", "received")}
      {renderSamples("pending", "Pending Approvals", "pending")}
      {renderSamples("yetToSend", "Yet to be Sent", "yetToSend")}
    </div>
  );
};

export default SampleApprovalDashboard;*/
