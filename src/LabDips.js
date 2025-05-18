import { useState, useEffect } from "react";
import "./ApprovalStatus.css";

const LabDips = () => {
    const [labDips, setLabDips] = useState({ approved: [], pending: [], yetToSend: [] });

    useEffect(() => {
        fetch("https://samplify-backend-production.up.railway.app/lab_dips")
            .then(res => res.json())
            .then(data => setLabDips(data))
            .catch(err => console.error("Error fetching Lab Dips:", err));
    }, []);

    const moveSample = (id, from, to) => {
        fetch(`https://samplify-backend-production.up.railway.app/lab_dips/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: to })
        })
            .then(response => response.json())
            .then(() => {
                setLabDips(prev => {
                    const item = prev[from].find(dip => dip.id === id);
                    if (!item) return prev;
                    
                    return {
                        ...prev,
                        [from]: prev[from].filter(dip => dip.id !== id),
                        [to]: [...prev[to], { ...item, status: to, date: to === "approved" ? new Date().toLocaleDateString("en-GB") : null }]
                    };
                });
            })
            .catch(error => console.error("Error updating status:", error));
    };

    const renderLabDips = (category, title, className) => (
        <div className={`section ${className}`}>
            <h2>{title}</h2>
            {labDips[category].map((dip) => (
                <div key={dip.id} className="card">
                    <p><strong>Style #:</strong> {dip.style}</p>
                    <p>👤 <strong>Buyer:</strong> {dip.buyer}</p>
                    <p>🌿 <strong>Fabric:</strong> {dip.fabric}</p>
                    <p>🎨 <strong>Color:</strong> {dip.color}</p>
                    <p><strong>Approved Shade:</strong> 
                        <select defaultValue={dip.shade || "A"}>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </p>
                    {dip.date && <p>📅 <strong>Date:</strong> {dip.date}</p>}
                    <div className="button-container">
                        {category === "pending" && (
                            <button className="approve" onClick={() => moveSample(dip.id, "pending", "approved")}>Approve ✅</button>
                        )}
                        {category === "yetToSend" && (
                            <button className="send" onClick={() => moveSample(dip.id, "yetToSend", "pending")}>Send for Approval 📤</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            <h1 className="title">Lab Dip Approval</h1>
            <div className="dashboard">
                {renderLabDips("approved", "Approved Lab Dips", "received")}
                {renderLabDips("pending", "Pending Lab Dips", "pending")}
                {renderLabDips("yetToSend", "Yet to be Sent", "yetToSend")}
            </div>
        </div>
    );
};

export default LabDips;
