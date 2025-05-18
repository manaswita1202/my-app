import React, { useState, useEffect, useCallback } from 'react';
import './SampleTracker.css';

// const GARMENT_TYPES = ['Shirt', 'T-Shirt', 'Shorts', 'Trousers']; // Keep for form or fetch if dynamic
// const SAMPLE_TYPES = [...] // This will be fetched from backend

const API_BASE_URL = 'http://localhost:5000/api/sample-tracker'; // Adjust port if your Flask runs elsewhere

function SampleTracker() {
  const [styles, setStyles] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newSampleTypePerStyle, setNewSampleTypePerStyle] = useState({}); // To hold input for new sample type for each style card

  const [availableGarmentTypes] = useState(['Shirt', 'T-Shirt', 'Shorts', 'Trousers']); // Static for now, can be fetched
  const [initialSampleTypes, setInitialSampleTypes] = useState([]); // For knowing what samples are default

  const [newStyle, setNewStyle] = useState({
    styleNumber: '',
    brand: '',
    garmentType: ''
  });

  // --- Helper to parse dates from server ---
  const parseStyleDates = (styleFromServer) => {
    return {
      ...styleFromServer,
      startDate: styleFromServer.startDate ? new Date(styleFromServer.startDate) : null,
      endDate: styleFromServer.endDate ? new Date(styleFromServer.endDate) : null,
      samples: styleFromServer.samples.map(s => ({
        ...s,
        startDate: s.startDate ? new Date(s.startDate) : null,
        endDate: s.endDate ? new Date(s.endDate) : null,
      }))
    };
  };

  // --- Fetching Data ---
  const fetchAllStyles = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/styles`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStyles(data.map(parseStyleDates));
    } catch (error) {
      console.error("Failed to fetch styles:", error);
      alert("Error fetching styles. Please try again later.");
    }
  }, []);

  const fetchInitialSampleTypes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sample-types`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInitialSampleTypes(data);
    } catch (error) {
      console.error("Failed to fetch initial sample types:", error);
      // Fallback if needed, though backend should provide this
      setInitialSampleTypes(['Fit Sample', 'PP Sample', 'SMS', 'Photoshoot Sample', 'TOP Sample', 'FOB Sample']);
    }
  }, []);

  useEffect(() => {
    fetchAllStyles();
    fetchInitialSampleTypes();
  }, [fetchAllStyles, fetchInitialSampleTypes]);

  // --- CRUD Operations ---

  const handleAddNewStyle = async () => {
    if (!newStyle.styleNumber || !newStyle.brand || !newStyle.garmentType) {
      alert('Please fill all fields for the new style.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/styles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStyle),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP error! status: ${response.status}`);
      }
      const addedStyleFromServer = await response.json();
      setStyles(prevStyles => [parseStyleDates(addedStyleFromServer), ...prevStyles]); // Add to top
      setNewStyle({ styleNumber: '', brand: '', garmentType: '' }); // Reset form
      setShowDialog(false);
    } catch (error) {
      console.error("Failed to add new style:", error);
      alert(`Error adding style: ${error.message}`);
    }
  };

  const handleDeleteStyle = async (styleId) => {
    if (window.confirm('Are you sure you want to delete this entire style and all its samples?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/styles/${styleId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        }
        setStyles(styles.filter(style => style.id !== styleId));
      } catch (error) {
        console.error("Failed to delete style:", error);
        alert(`Error deleting style: ${error.message}`);
      }
    }
  };

  const handleAddSample = async (styleId, sampleType) => {
    if (!sampleType || !sampleType.trim()) {
      alert("Please enter a valid sample type.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/styles/${styleId}/samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: sampleType.trim() }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP error! status: ${response.status}`);
      }
      const updatedStyleFromServer = await response.json();
      setStyles(styles.map(s => s.id === styleId ? parseStyleDates(updatedStyleFromServer) : s));
      setNewSampleTypePerStyle(prev => ({ ...prev, [styleId]: "" })); // Clear input for this style
    } catch (error) {
      console.error("Failed to add sample:", error);
      alert(`Error adding sample: ${error.message}`);
    }
  };

  const handleDeleteSample = async (styleId, sampleId) => {
    if (window.confirm('Are you sure you want to delete this sample?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/styles/${styleId}/samples/${sampleId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || `HTTP error! status: ${response.status}`);
        }
        const updatedStyleFromServer = await response.json();
        setStyles(styles.map(s => s.id === styleId ? parseStyleDates(updatedStyleFromServer) : s));
      } catch (error) {
        console.error("Failed to delete sample:", error);
        alert(`Error deleting sample: ${error.message}`);
      }
    }
  };

  const handleToggleSample = async (styleId, sampleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/styles/${styleId}/samples/${sampleId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }, // Good practice, though no body here
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `HTTP error! status: ${response.status}`);
      }
      const updatedStyleFromServer = await response.json();
      setStyles(styles.map(s => s.id === styleId ? parseStyleDates(updatedStyleFromServer) : s));
    } catch (error) {
      console.error("Failed to toggle sample:", error);
      alert(`Error updating sample: ${error.message}`);
    }
  };


  // --- Utility Functions ---
  const getProgressWidth = (samples) => {
    if (!samples || samples.length === 0) return '0%';
    const completedCount = samples.filter(s => s.completed).length;
    return `${(completedCount / samples.length) * 100}%`;
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    // Ensure dates are Date objects
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0; // Invalid date

    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days; // Avoid negative days if end < start due to some issue
  };

  const handleSampleTypeInputChange = (styleId, value) => {
    setNewSampleTypePerStyle(prev => ({ ...prev, [styleId]: value }));
  };

  return (
    <div className="sample-tracker">
      <h1>Sample Tracking Dashboard</h1>
      
      <button className="add-button" onClick={() => setShowDialog(true)}>
        Add New Style
      </button>

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Add New Style</h2>
            <input
              type="text"
              placeholder="Style Number"
              value={newStyle.styleNumber}
              onChange={(e) => setNewStyle({...newStyle, styleNumber: e.target.value})}
            />
            <input
              type="text"
              placeholder="Brand"
              value={newStyle.brand}
              onChange={(e) => setNewStyle({...newStyle, brand: e.target.value})}
            />
            <select
              value={newStyle.garmentType}
              onChange={(e) => setNewStyle({...newStyle, garmentType: e.target.value})}
            >
              <option value="">Select Garment Type</option>
              {availableGarmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="dialog-buttons">
              <button onClick={handleAddNewStyle}>Add</button>
              <button onClick={() => { setShowDialog(false); setNewStyle({ styleNumber: '', brand: '', garmentType: '' }); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="styles-container">
        {styles.map(style => (
          <div key={style.id} className="style-card">
            <div className="style-header">
              <div className="style-info">
                <h2>
                  Style Number: {style.styleNumber} <br />
                  Brand: {style.brand} <br />
                  Garment: {style.garmentType}
                </h2>
              </div>
              <div className="style-dates">
                <p>Start: {style.startDate?.toLocaleDateString()}</p>
                {style.endDate && (
                  <>
                    <p>End: {style.endDate.toLocaleDateString()}</p>
                    <p>Total Days: {calculateDays(style.startDate, style.endDate)}</p>
                  </>
                )}
                <button 
                  className={`status-button ${style.endDate ? 'completed' : 'progress'}`}
                  disabled // Status button is just informational
                >
                  {style.endDate ? "Completed" : "In Progress"}
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteStyle(style.id)}
                >
                  Delete Style
                </button>
              </div>
            </div>

            <div className="sample-timeline">
              <div className="timeline-line"></div>
              <div 
                className="timeline-progress" 
                style={{ width: getProgressWidth(style.samples) }}
              ></div>
              <div className="timeline-points">
              {/* Ensure samples are sorted or rely on backend order. Backend sorts by sample.id */}
              {style.samples && style.samples.map((sample) => (
                <div key={sample.id} className="sample-point"> {/* Use sample.id as key */}
                  <button
                    className={`checkpoint ${sample.completed ? 'completed' : ''}`}
                    onClick={() => handleToggleSample(style.id, sample.id)} // Pass sample.id
                  ></button>
                  <p className="sample-label">{sample.type}</p>
                  {sample.completed && sample.startDate && sample.endDate && (
                    <p className="sample-days">
                      {calculateDays(sample.startDate, sample.endDate)} days
                    </p>
                  )}
                  <button 
                    className="delete-sample-button"
                    title="Delete this sample"
                    onClick={() => handleDeleteSample(style.id, sample.id)} // Pass sample.id
                  >
                    ❌
                  </button>
                </div>
              ))}
              </div>
                <div className="add-sample">
                  <input 
                    type="text" 
                    placeholder="Enter new sample type" 
                    value={newSampleTypePerStyle[style.id] || ""} 
                    onChange={(e) => handleSampleTypeInputChange(style.id, e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleAddSample(style.id, newSampleTypePerStyle[style.id]);}}
                  />
                  <button 
                    className="add-sample-button" 
                    onClick={() => handleAddSample(style.id, newSampleTypePerStyle[style.id])}
                  >
                    + Add Sample
                  </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SampleTracker;