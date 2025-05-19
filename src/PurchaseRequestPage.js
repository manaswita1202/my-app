import React, { useState, useEffect } from 'react';
import { Plus, Mail, Search, Download, Trash2 } from 'lucide-react';
import './PurchaseRequest.css'; // Import the CSS file

const PurchaseRequestPage = () => {
  // State for styles
  const [availableStyles, setAvailableStyles] = useState([]);
  const [stylesLoading, setStylesLoading] = useState(true);
  const [stylesError, setStylesError] = useState(null);

  // State for selected styles and BOM
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [bomData, setBomData] = useState([]);
  
  // State for UI elements
  const [customColumns, setCustomColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [isProcessingPR, setIsProcessingPR] = useState(false);

  // Fetch available styles from API on component mount
  useEffect(() => {
    const fetchStyles = async () => {
      setStylesLoading(true);
      setStylesError(null);
      try {
        const response = await fetch('https://samplify-backend-production.up.railway.app/styles');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Map API data. Store the full original style object for later access to techpackData.
        setAvailableStyles(data.map(s => ({
          id: s.id,
          // Use styleNumber for 'code' display on the card
          code: s.styleNumber, 
          // Construct a 'name' for display on the card
          name: `${s.brand || 'N/A'} - ${s.garment || s.sampleType || s.styleNumber || 'Unnamed Style'}`, 
          // Store the full original object from API
          originalStyleData: s 
        })));
      } catch (error) {
        console.error("Failed to fetch styles:", error);
        setStylesError(error.message);
      } finally {
        setStylesLoading(false);
      }
    };

    fetchStyles();
  }, []);

  const handleStyleSelection = (style) => {
    setSelectedStyles(prev => {
      const isSelected = prev.find(s => s.id === style.id);
      if (isSelected) {
        return prev.filter(s => s.id !== style.id);
      } else {
        // 'style' here is the mapped object: { id, code, name, originalStyleData }
        return [...prev, style]; 
      }
    });
  };

  const generatePR = () => {
    if (selectedStyles.length === 0) {
      alert('Please select at least one style');
      return;
    }
    setIsProcessingPR(true);
    setBomData([]); // Clear previous BOM data

    const newBomData = [];
    let bomItemIdCounter = 0; // For generating unique IDs for BOM items

    selectedStyles.forEach(selectedStyleMapped => {
      // Access the original style data which contains techpackData
      const styleApiData = selectedStyleMapped.originalStyleData; 

      const techpack = styleApiData.techpackData;
      if (techpack && techpack.bom) {
        const { fabric, trims } = techpack.bom;

        // IMPORTANT: The following sections assume specific key names within your 
        // techpackData.bom.fabric and techpackData.bom.trims arrays.
        // Assumed keys for items: item_code, item_name, consumption, uom, supplier.
        // Please ADJUST these keys if your actual API data uses different names.
        // For example, if 'consumption' is 'qty_needed', change `item.consumption` to `item.qty_needed`.

        // Process Fabric items
        if (fabric && Array.isArray(fabric)) {
          fabric.forEach((item, index) => {
            newBomData.push({
              id: `bom-item-${bomItemIdCounter++}`, // Unique ID for the BOM item row
              styleId: styleApiData.id,
              type: 'Fabric',
              code: item.code || `FAB-CODE-${styleApiData.id}-${index}`, // Fallback if item_code is missing
              name: item.description || `Fabric Item ${index + 1}`, // Fallback
              quantity: item.quantity !== undefined ? item.quantity : 0, // Fallback
              unit: item.uom || 'N/A', // Fallback
              supplier: item.supplier || 'N/A', // Fallback
              prChecked: false,
            });
          });
        }

        // Process Trims items
        if (trims && Array.isArray(trims)) {
          trims.forEach((item, index) => {
            newBomData.push({
              id: `bom-item-${bomItemIdCounter++}`, // Unique ID for the BOM item row
              styleId: styleApiData.id,
              type: 'Trim',
              code: item.code || `TRIM-CODE-${styleApiData.id}-${index}`, // Fallback if item_code is missing
              name: item.trim || `Trim Item ${index + 1}`, // Fallback
              quantity: item.quantity !== undefined ? item.quantity : 0, // Fallback
              unit: item.uom || 'N/A', // Fallback
              supplier: item.supplier || 'N/A', // Fallback
              prChecked: false,
            });
          });
        }
      } else {
        console.warn(`Style ${styleApiData.styleNumber} (ID: ${styleApiData.id}) has no techpackData or bom data.`);
      }
    });
    
    setBomData(newBomData);
    setIsProcessingPR(false);
  };

  const togglePRCheck = (itemId) => {
    setBomData(prev => prev.map(item => 
      item.id === itemId ? { ...item, prChecked: !item.prChecked } : item
    ));
  };

  const addCustomColumn = () => {
    if (newColumnName.trim()) {
      setCustomColumns(prev => [...prev, { 
        id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // More robust unique ID
        name: newColumnName.trim() 
      }]);
      setNewColumnName('');
      setShowAddColumn(false);
    }
  };

  const removeCustomColumn = (columnId) => {
    setCustomColumns(prev => prev.filter(col => col.id !== columnId));
    // Also remove data for this column from bomData items
    setBomData(prevBomData => prevBomData.map(item => {
      if (item.customData && item.customData.hasOwnProperty(columnId)) {
        const { [columnId]: _, ...restCustomData } = item.customData;
        return { ...item, customData: restCustomData };
      }
      return item;
    }));
  };

  const updateCustomColumnValue = (itemId, columnId, value) => {
    setBomData(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          customData: {
            ...(item.customData || {}),
            [columnId]: value
          }
        };
      }
      return item;
    }));
  };

  const sendEmail = () => {
    const checkedItems = bomData.filter(item => item.prChecked);
    if (checkedItems.length === 0) {
      alert('Please select at least one item for PR');
      return;
    }
  
    const subject = 'Purchase Request - Trims/Fabric Code PR';
  
    // Build body content from selected items
    let body = `Hi Eswar,\n\nPlease find the attached trims/fabric code PR:\n\n`;
    checkedItems.forEach((item, index) => {
      body += `Item ${index + 1}:\n`;
      body += `  Code     : ${item.code}\n`;
      body += `  Name     : ${item.name}\n`;
      body += `  Quantity : ${item.quantity} ${item.unit}\n`;
      body += `  Supplier : ${item.supplier}\n\n`;
    });
  
    body += `Regards,\n[Your Name]`; // Optional closing
  
    const emailUrl = `mailto:eswar.a@arvindexports.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };
  
  const exportToCSV = () => {
    const checkedItems = bomData.filter(item => item.prChecked);
    if (checkedItems.length === 0) {
      alert('Please select at least one item to export');
      return;
    }

    const headers = ['Type', 'Code', 'Name', 'Quantity', 'Unit', 'Supplier', ...customColumns.map(col => col.name)];
    const csvContent = [
      headers.join(','),
      ...checkedItems.map(item => [
        item.type,
        item.code,
        item.name,
        item.quantity,
        item.unit,
        item.supplier,
        ...customColumns.map(col => item.customData?.[col.id] || '')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `purchase_request_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); // Required for Firefox and some other browsers
    link.click();
    document.body.removeChild(link); // Clean up
    window.URL.revokeObjectURL(url);
  };

  // UI Rendering based on styles loading state
  if (stylesLoading) {
    // Users should define .loading-container and .loading-spinner-large in PurchaseRequest.css
    return (
      <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.2rem' }}>
        <div className="loading-spinner-large" style={{ border: '6px solid #f3f3f3', borderTop: '6px solid #3498db', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
        <p>Loading styles...</p>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (stylesError) {
     // Users should define .error-container in PurchaseRequest.css
    return <div className="error-container" style={{color: 'red', textAlign: 'center', marginTop: '50px'}}>Error loading styles: {stylesError}. Please try refreshing the page or check if the API is running.</div>;
  }

  return (
    <div className="purchase-request-container">
      <div className="main-wrapper">
        <div className="main-card">
          <h1 className="page-title">Purchase Request Generator</h1>
          
          <div className="section-wrapper">
            <h2 className="section-header">Select Styles</h2>
            {availableStyles.length > 0 ? (
              <div className="styles-grid">
                {availableStyles.map(style => ( // style is the mapped object: {id, code, name, originalStyleData}
                  <div
                    key={style.id}
                    className={`style-card ${selectedStyles.find(s => s.id === style.id) ? 'selected' : ''}`}
                    onClick={() => handleStyleSelection(style)}
                  >
                    <div className="style-card-content">
                      <div className="style-info">
                        <p className="style-code">{style.code}</p>
                        <p className="style-name">{style.name}</p>
                      </div>
                      <div className={`style-checkbox ${selectedStyles.find(s => s.id === style.id) ? 'checked' : ''}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No styles available.</p>
            )}
            
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={generatePR}
                disabled={selectedStyles.length === 0 || isProcessingPR}
                className="btn btn-primary"
              >
                {isProcessingPR ? (
                  <>
                    <div className="loading-spinner"></div>
                    Generating PR...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Generate PR
                  </>
                )}
              </button>
            </div>
          </div>

          {isProcessingPR && bomData.length === 0 && (
             <div className="section-wrapper" style={{textAlign: 'center', padding: '2rem'}}>
                <div className="loading-spinner"></div>
                <p>Processing BOM items...</p>
             </div>
          )}

          {bomData.length > 0 && !isProcessingPR && (
            <div className="section-wrapper">
              <div className="table-header">
                <h2 className="section-header">BOM Items</h2>
                <div className="table-actions">
                  <button
                    onClick={() => setShowAddColumn(true)}
                    className="btn btn-secondary"
                  >
                    <Plus size={16} />
                    Add Column
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="btn btn-tertiary"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
              </div>

              {showAddColumn && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3 className="modal-title">Add Custom Column</h3>
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Column name"
                      className="modal-input"
                      autoFocus
                    />
                    <div className="modal-actions">
                      <button
                        onClick={addCustomColumn}
                        className="btn btn-primary"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddColumn(false);
                          setNewColumnName('');
                        }}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>PR Check</th>
                      <th>Type</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Supplier</th>
                      {customColumns.map(column => (
                        <th key={column.id}>
                          <div className="custom-column-header">
                            {column.name}
                            <button
                              onClick={() => removeCustomColumn(column.id)}
                              className="remove-column-btn"
                              title={`Remove column "${column.name}"`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bomData.map(item => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={item.prChecked}
                            onChange={() => togglePRCheck(item.id)}
                            className="checkbox"
                          />
                        </td>
                        <td>
                          <span className={`type-badge ${item.type.toLowerCase()}`}>
                            {item.type}
                          </span>
                        </td>
                        <td>
                          <span className="item-code">{item.code}</span>
                        </td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>{item.supplier}</td>
                        {customColumns.map(column => (
                          <td key={column.id}>
                            <input
                              type="text"
                              value={item.customData?.[column.id] || ''}
                              onChange={(e) => updateCustomColumnValue(item.id, column.id, e.target.value)}
                              className="custom-input"
                              placeholder={`Enter ${column.name}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="email-section">
                <button
                  onClick={sendEmail}
                  disabled={bomData.filter(item => item.prChecked).length === 0}
                  className="btn btn-warning"
                >
                  <Mail size={16} />
                  Send Email to Eswar
                </button>
                <p className="email-info">
                  Selected {bomData.filter(item => item.prChecked).length} items for PR
                </p>
              </div>
            </div>
          )}

          {/* Empty State for BOM Data */}
          {bomData.length === 0 && !isProcessingPR && selectedStyles.length > 0 && (
             <div className="empty-state">
                <div className="empty-state-icon">
                    <Search size={64} />
                </div>
                <p className="empty-state-text">No BOM items found for the selected styles. This could mean the styles have no fabric/trim data in their techpack, or the techpack data is empty.</p>
            </div>
          )}
          {bomData.length === 0 && !isProcessingPR && selectedStyles.length === 0 && availableStyles.length > 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={64} />
              </div>
              <p className="empty-state-text">Select styles and click "Generate PR" to view BOM items.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestPage;