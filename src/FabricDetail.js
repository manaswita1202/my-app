import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./FabricDetail.css";

const FabricDetail = () => {
  const { fabricName } = useParams();
  const [fabric, setFabric] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [brandFilter, setBrandFilter] = useState("All");
  const [newFabric, setNewFabric] = useState({
    image: "",
    composition: "",  
    structure: "",
    shade: "",
    brand: "",
    code: "",
    rate: "",
    supplier : ""
  });

  useEffect(() => {
    fetchFabricDetail();
  }, [fabricName]);

  const fetchFabricDetail = async () => {
    try {
      const response = await fetch(`https://samplify-backend-production.up.railway.app/api/fabrics/${fabricName}`);
      if (!response.ok) throw new Error("Fabric not found");
      const data = await response.json();
      setFabric(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewFabric({ ...newFabric, [e.target.name]: e.target.value });
  };

  const handleAddVariant = async () => {
    if (!fabric) return;

    const response = await fetch(`https://samplify-backend-production.up.railway.app/api/fabrics/${fabric.id}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFabric)
    });

    if (response.ok) {
      fetchFabricDetail();
      setShowModal(false);
      setNewFabric({ image: "", composition: "", structure: "", shade: "", brand: "", code: "", rate: "", supplier : "" });
    } else {
      alert("Error adding variant");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) return;
  
    try {
      const response = await fetch(`https://samplify-backend-production.up.railway.app/api/fabric-variants/${variantId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        fetchFabricDetail(); // Refresh after delete
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
  if (!fabric) return <p>Fabric not found</p>;

  return (
    <div className="detail-container">
      <h2>{fabric.name}</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="brandFilter"><strong>Filter by Brand: </strong></label>
        <select
          id="brandFilter"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Hugo Boss">Hugo Boss</option>
          <option value="River Island">River Island</option>
          <option value="US Polo">US Polo</option>
        </select>
      </div>
      <button onClick={() => {
        setNewFabric({ ...newFabric, brand: brandFilter !== "All" ? brandFilter : "" });
        setShowModal(true);
      }} className="add-btn">
        Add Fabric Variant
      </button>

      <div className="variant-list">
        {fabric.variants.filter(variant => brandFilter === "All" || variant.brand === brandFilter)
        .map((variant, index) => (
          <div key={index} className="variant-card">
            <div className="delete-icon" onClick={() => handleDeleteVariant(variant.id)}>
              🗑️
            </div>
            <img src={`/assets/${variant.image}`} alt={fabric.name} />
            <div className="variant-info">
              <p><strong>Composition:</strong> {variant.composition}</p>
              <p><strong>Structure:</strong> {variant.structure}</p>
              <p><strong>Shade:</strong> {variant.shade}</p>
              <p><strong>Brand:</strong> {variant.brand}</p>
              <p><strong>Code:</strong> {variant.code}</p>
              <p><strong>Rate:</strong> {variant.rate}</p>
              <p><strong>Supplier:</strong> {variant.supplier}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Adding a Variant */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Fabric Variant</h3>
            <input 
              type="text" 
              name="image" 
              placeholder="Image Name" 
              value={newFabric.image} 
              onChange={handleInputChange} 
            />
            <input 
              type="text" 
              name="composition" 
              placeholder="Composition" 
              value={newFabric.composition} 
              onChange={handleInputChange} 
            />
            <input 
              type="text" 
              name="structure" 
              placeholder="Structure " 
              value={newFabric.structure} 
              onChange={handleInputChange} 
            />
            <input 
              type="text" 
              name="shade" 
              placeholder="Shade" 
              value={newFabric.shade} 
              onChange={handleInputChange} 
            />
            <input 
              type="text" 
              name="brand" 
              placeholder="Brand" 
              value={newFabric.brand} 
              onChange={handleInputChange} 
            />
            <input 
              type="text" 
              name="code" 
              placeholder="Code" 
              value={newFabric.code} 
              onChange={handleInputChange} 
            />
            <input 
              type="text" 
              name="rate" 
              placeholder="Rate" 
              value={newFabric.rate} 
              onChange={handleInputChange} 
            />
            <input 
              type="text" 
              name="supplier" 
              placeholder="Supplier" 
              value={newFabric.supplier} 
              onChange={handleInputChange} 
            />
            <button onClick={handleAddVariant} className="save-btn">Save</button>
            <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricDetail;