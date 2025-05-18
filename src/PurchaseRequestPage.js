import React, { useState, useEffect } from 'react';
import { Plus, Mail, Search, Download, Trash2 } from 'lucide-react';
import './PurchaseRequest.css'; // Import the CSS file

const PurchaseRequestPage = () => {
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [bomData, setBomData] = useState([]);
  const [customColumns, setCustomColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock styles data - replace with your actual styles
  const availableStyles = [
    { id: 1, code: 'ST001', name: 'Summer Collection A' },
    { id: 2, code: 'ST002', name: 'Winter Collection B' },
    { id: 3, code: 'ST003', name: 'Spring Collection C' },
    { id: 4, code: 'ST004', name: 'Autumn Collection D' },
    { id: 5, code: 'ST005', name: 'Casual Wear E' },
  ];

  // Mock BOM data fetching function
  const fetchBOMData = async (styleIds) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock BOM data - replace with actual API call
    const mockBomData = styleIds.flatMap(styleId => [
      {
        id: `${styleId}-1`,
        styleId,
        type: 'Fabric',
        code: `FAB${styleId}001`,
        name: `Cotton Blend Fabric ${styleId}`,
        quantity: 5.5,
        unit: 'mts',
        supplier: 'Fabric Supplier A',
        prChecked: false
      },
      {
        id: `${styleId}-2`,
        styleId,
        type: 'Trim',
        code: `TRM${styleId}001`,
        name: `Button Set ${styleId}`,
        quantity: 12,
        unit: 'pcs',
        supplier: 'Trim Supplier B',
        prChecked: false
      },
      {
        id: `${styleId}-3`,
        styleId,
        type: 'Trim',
        code: `TRM${styleId}002`,
        name: `Zipper ${styleId}`,
        quantity: 1,
        unit: 'pc',
        supplier: 'Zipper Supplier C',
        prChecked: false
      }
    ]);
    
    setBomData(mockBomData);
    setIsLoading(false);
  };

  const handleStyleSelection = (style) => {
    setSelectedStyles(prev => {
      const isSelected = prev.find(s => s.id === style.id);
      if (isSelected) {
        return prev.filter(s => s.id !== style.id);
      } else {
        return [...prev, style];
      }
    });
  };

  const generatePR = () => {
    if (selectedStyles.length === 0) {
      alert('Please select at least one style');
      return;
    }
    const styleIds = selectedStyles.map(style => style.id);
    fetchBOMData(styleIds);
  };

  const togglePRCheck = (itemId) => {
    setBomData(prev => prev.map(item => 
      item.id === itemId ? { ...item, prChecked: !item.prChecked } : item
    ));
  };

  const addCustomColumn = () => {
    if (newColumnName.trim()) {
      setCustomColumns(prev => [...prev, { 
        id: Date.now(), 
        name: newColumnName.trim() 
      }]);
      setNewColumnName('');
      setShowAddColumn(false);
    }
  };

  const removeCustomColumn = (columnId) => {
    setCustomColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const updateCustomColumnValue = (itemId, columnId, value) => {
    setBomData(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          customData: {
            ...item.customData,
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
    const body = 'Hi Eswar, Plz fnd the attached trims/fabric code PR';
    const emailUrl = `mailto:eswar.a@arvindexports.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(emailUrl);
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

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `purchase_request_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="purchase-request-container">
      <div className="main-wrapper">
        <div className="main-card">
          <h1 className="page-title">Purchase Request Generator</h1>
          
          {/* Style Selection Section */}
          <div className="section-wrapper">
            <h2 className="section-header">Select Styles</h2>
            <div className="styles-grid">
              {availableStyles.map(style => (
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
            
            {/* Generate PR Button */}
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={generatePR}
                disabled={selectedStyles.length === 0 || isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
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

          {/* BOM Data Table */}
          {bomData.length > 0 && (
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

              {/* Add Column Modal */}
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

              {/* Email Button */}
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

          {/* Empty State */}
          {bomData.length === 0 && !isLoading && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={64} />
              </div>
              <p className="empty-state-text">Select styles and click "Generate PR" to view BOM items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestPage;