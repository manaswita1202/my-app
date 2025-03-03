import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./TrimDetail.css";

const TrimDetail = () => {
  const { trimName } = useParams();
  const [trim, setTrim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTrim, setNewTrim] = useState({
    image: "",
    composition: "",
    structure: "",
    shade: "",
    brand: ""
  });

  useEffect(() => {
    fetchTrimDetail();
  }, [trimName]);

  const fetchTrimDetail = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/trims/${trimName}`);
      if (!response.ok) throw new Error("Trim not found");
      const data = await response.json();
      setTrim(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewTrim({ ...newTrim, [e.target.name]: e.target.value });
  };

  const handleAddVariant = async () => {
    if (!trim) return;

    const response = await fetch(`http://localhost:5000/api/trims/${trim.id}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTrim)
    });

    if (response.ok) {
      fetchTrimDetail();
      setShowModal(false);
      setNewTrim({ image: "", composition: "", structure: "", shade: "", brand: "" });
    } else {
      alert("Error adding variant");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!trim) return <p>Trim not found</p>;

  return (
    <div className="detail-container">
      <h2>{trim.name}</h2>
      <button onClick={() => setShowModal(true)} className="add-btn">Add Trim Variant</button>

      <div className="variant-list">
        {trim.variants.map((variant, index) => (
          <div key={index} className="variant-card">
            <img src={`/assets/${variant.image}`} alt={trim.name} />
            <div className="variant-info">
              <p><strong>Composition:</strong> {variant.composition}</p>
              <p><strong>Structure:</strong> {variant.structure}</p>
              <p><strong>Shade:</strong> {variant.shade}</p>
              <p><strong>Brand:</strong> {variant.brand}</p>
              <p><strong>Code:</strong> {variant.code}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Adding a Variant */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Trim Variant</h3>
            <input type="text" name="image" placeholder="Image Name" value={newTrim.image} onChange={handleInputChange} />
            <input type="text" name="composition" placeholder="Composition" value={newTrim.composition} onChange={handleInputChange} />
            <input type="text" name="structure" placeholder="Structure" value={newTrim.structure} onChange={handleInputChange} />
            <input type="text" name="shade" placeholder="Shade" value={newTrim.shade} onChange={handleInputChange} />
            <input type="text" name="brand" placeholder="Brand" value={newTrim.brand} onChange={handleInputChange} />
            <button onClick={handleAddVariant} className="save-btn">Save</button>
            <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrimDetail;
