import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./TrimDetail.css";

const TrimDetail = () => {
  const { trimName } = useParams();
  const [trim, setTrim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [brandFilter, setBrandFilter] = useState("All");
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

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/variants/${variantId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        fetchTrimDetail(); // Refresh after delete
      } else {
        alert("Failed to delete the variant.");
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      alert("An error occurred while deleting.");
    }
  };
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!trim) return <p>Trim not found</p>;

  return (
    <div className="detail-container">
      <h2>{trim.name}</h2>
      <div style={{ marginBottom: "1rem" }}>
  <label htmlFor="brandFilter"><strong>Filter by Brand: </strong></label>
  <select
    id="brandFilter"
    value={brandFilter}
    onChange={(e) => setBrandFilter(e.target.value)}
  >
    <option value="All">All</option>
    <option value="Hugo Boss">Hugo Boss</option>
    <option value="Arrow">Arrow</option>
    <option value="US Polo">US Polo</option>
  </select>
</div>
<button onClick={() => {
  setNewTrim({ ...newTrim, brand: brandFilter !== "All" ? brandFilter : "" });
  setShowModal(true);
}} className="add-btn">
  Add Trim Variant
</button>


      <div className="variant-list">
        {trim.variants.filter(variant => brandFilter === "All" || variant.brand === brandFilter)
        .map((variant, index) => (
          <div key={index} className="variant-card">
             <div className="delete-icon" onClick={() => handleDeleteVariant(variant.id)}>
    🗑️
  </div>
            <img src={`/assets/${variant.image}`} alt={trim.name} />
            <div className="variant-info">
              <p><strong>Composition:</strong> {variant.composition}</p>
              <p><strong>Supplier:</strong> {variant.structure}</p>
              <p><strong>Shade:</strong> {variant.shade}</p>
              <p><strong>Brand:</strong> {variant.brand}</p>
              <p><strong>Code:</strong> {variant.code}</p>
              <p><strong>Rate:</strong> {variant.rate}</p>
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
            <input type="text" name="structure" placeholder="supplier" value={newTrim.structure} onChange={handleInputChange} />
            <input type="text" name="shade" placeholder="Shade" value={newTrim.shade} onChange={handleInputChange} />
            <input type="text" name="brand" placeholder="Brand" value={newTrim.brand} onChange={handleInputChange} />
            <input type="text" name="code" placeholder="code" value={newTrim.code} onChange={handleInputChange} />
            <input type="text" name="rate" placeholder="rate" value={newTrim.rate} onChange={handleInputChange} />
            <button onClick={handleAddVariant} className="save-btn">Save</button>
            <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrimDetail;
