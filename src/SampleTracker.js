import React, { useState } from 'react';
import './SampleTracker.css';

const GARMENT_TYPES = ['Shirt', 'T-Shirt', 'Shorts', 'Trousers'];
const SAMPLE_TYPES = ['Fit Sample', 'PP Sample', 'SMS', 'Photoshoot Sample', 'TOP Sample', 'FOB Sample'];

function SampleTracker() {
  const [styles, setStyles] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newSampleType, setNewSampleType] = useState("");

  const [newStyle, setNewStyle] = useState({
    styleNumber: '',
    brand: '',
    garmentType: ''
  });
  const deleteSample = (styleId, sampleIndex) => {
    setStyles(styles.map(style => {
      if (style.id !== styleId) return style;
  
      const newSamples = style.samples.filter((_, index) => index !== sampleIndex);
  
      return {
        ...style,
        samples: newSamples
      };
    }));
  };
  const addSample = (styleId, sampleType) => {
    if (!sampleType) {
      alert("Please enter a valid sample type.");
      return;
    }
  
    setStyles(styles.map(style => {
      if (style.id !== styleId) return style;
  
      const newSample = {
        type: sampleType,
        completed: false,
        startDate: null,
        endDate: null
      };
  
      return {
        ...style,
        samples: [...style.samples, newSample]
      };
    }));
  };
  


  const addNewStyle = () => {
    if (!newStyle.styleNumber || !newStyle.brand || !newStyle.garmentType) {
      alert('Please fill all fields');
      return;
    }    

    const style = {
      ...newStyle,
      id: Date.now(),
      startDate: new Date(),
      samples: SAMPLE_TYPES.map(type => ({
        type,
        completed: false,
        startDate: null,
        endDate: null
      })),
      endDate: null
    };

    setStyles([...styles, style]);
    setNewStyle({ styleNumber: '', brand: '', garmentType: '' });
    setShowDialog(false);
  };

  const toggleSample = (styleId, sampleIndex) => {
    setStyles(styles.map(style => {
      if (style.id !== styleId) return style;

      const newSamples = [...style.samples];
      newSamples[sampleIndex] = {
        ...newSamples[sampleIndex],
        completed: !newSamples[sampleIndex].completed,
        startDate: newSamples[sampleIndex].startDate || new Date(),
        endDate: !newSamples[sampleIndex].completed ? new Date() : null
      };

      const allCompleted = newSamples.every(sample => sample.completed);
      return {
        ...style,
        endDate: allCompleted ? new Date() : null,
        samples: newSamples
      };
    }));
  };

  // ✅ Define getProgressWidth function properly
  const getProgressWidth = (samples) => {
    if (!samples.length) return '0%';
    const completedCount = samples.filter(s => s.completed).length;
    return `${(completedCount / samples.length) * 100}%`;
  };

  const deleteStyle = (styleId) => {
    if (window.confirm('Are you sure you want to delete this style?')) {
      setStyles(styles.filter(style => style.id !== styleId));
    }
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate) - new Date(startDate);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
              {GARMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="dialog-buttons">
              <button onClick={addNewStyle}>Add</button>
              <button onClick={() => setShowDialog(false)}>Cancel</button>
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
                >
                  {style.endDate ? "Completed" : "In Progress"}
                </button>
                <button 
                  className="delete-button"
                  onClick={() => deleteStyle(style.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="sample-timeline">
              <div className="timeline-line"></div>
              <div 
                className="timeline-progress" 
                style={{ width: getProgressWidth(style.samples) }} // ✅ Now works correctly
              ></div>
              <div className="timeline-points">
              {style.samples.map((sample, index) => (
                <div key={sample.type} className="sample-point">
                  <button
                    className={`checkpoint ${sample.completed ? 'completed' : ''}`}
                    onClick={() => toggleSample(style.id, index)}
                  ></button>
                  <p className="sample-label">{sample.type}</p>
                  {sample.completed && (
                    <p className="sample-days">
                      {calculateDays(sample.startDate, sample.endDate)} days
                    </p>
                  )}
                  {/* Delete Sample Button */}
                  <button 
                    className="delete-sample-button"
                    onClick={() => deleteSample(style.id, index)}
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
                    value={newSampleType} 
                    onChange={(e) => setNewSampleType(e.target.value)} 
                  />
                  <button 
                    className="add-sample-button" 
                    onClick={() => addSample(style.id, newSampleType)}
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
