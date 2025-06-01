import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './InspirationForm.css';

const InspirationForm = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [referredPreferences, setReferredPreferences] = useState({
    fabricType: false,
    colours: false,
    printsPatterns: false,
    collar: false,
    sleeve: false,
    fit: false,
    gender: false,
  });
  const [recommendedPreferences, setRecommendedPreferences] = useState({
    fabricType: false,
    colours: false,
    printsPatterns: false,
    collar: false,
    sleeve: false,
    fit: false,
    gender: false,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      // Reset results when new image is selected
      setAnalysisResult(null);
    } else {
      setSelectedImage(null);
      setImagePreviewUrl('');
    }
  };

  const handleReferredChange = (e) => {
    const { name, checked } = e.target;
    setReferredPreferences(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  const handleRecommendedChange = (e) => {
    const { name, checked } = e.target;
    setRecommendedPreferences(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);
    // Add preferences to the form data
    formData.append("referredPreferences", JSON.stringify(referredPreferences));
    formData.append("recommendedPreferences", JSON.stringify(recommendedPreferences));
  
    try {
      const response = await fetch("https://samplify-backend-production.up.railway.app/analyze-image", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReverseImageSearch = () => {
    if (selectedImage) {
      // Open Google Lens in a new tab
      window.open('https://lens.google.com/', '_blank');
      alert('Please drag and drop your image to Google Lens, or use the upload option.');
    } else {
      alert('Please select an image first');
    }
  };

  // Function to convert object data to chart format
  const convertToChartData = (data, colors) => {
    if (!data) return [];
    
    return Object.entries(data)
      .filter(([key, value]) => value > 0) // Only include items with values > 0
      .map(([key, value], index) => ({
        name: key,
        value: value,
        fill: colors[index % colors.length]
      }));
  };

  // Helper function to check if any referred preferences are selected
  const hasReferredPreferences = () => {
    return Object.values(referredPreferences).some(value => value === true);
  };

  // Helper function to check if any recommended preferences are selected
  const hasRecommendedPreferences = () => {
    return Object.values(recommendedPreferences).some(value => value === true);
  };

  // Helper function to render basic analysis info based on selected preferences
  const renderBasicAnalysisInfo = () => {
    if (!analysisResult?.analysis) return null;

    const info = [];
    const analysis = analysisResult.analysis;

    // Always show garment type
    info.push(<li key="garmentType"><strong>Garment Type:</strong> {analysis.garmentType}</li>);

    // Show other fields based on referred preferences
    if (referredPreferences.printsPatterns && analysis.pattern) {
      info.push(<li key="pattern"><strong>Pattern:</strong> {analysis.pattern}</li>);
    }
    if (referredPreferences.colours && analysis.color) {
      info.push(<li key="color"><strong>Colour:</strong> {analysis.color}</li>);
    }
    if (referredPreferences.fit && analysis.fit) {
      info.push(<li key="fit"><strong>Fit:</strong> {analysis.fit}</li>);
    }
    if (referredPreferences.collar && analysis.collarType) {
      info.push(<li key="collarType"><strong>Collar Type:</strong> {analysis.collarType}</li>);
    }
    if (referredPreferences.gender && analysis.gender) {
      info.push(<li key="gender"><strong>Gender:</strong> {analysis.gender}</li>);
    }
    if (referredPreferences.fabricType && analysis.style) {
      info.push(<li key="style"><strong>Style:</strong> {analysis.style}</li>);
    }

    // Always show confidence
    if (analysis.confidence) {
      info.push(<li key="confidence"><strong>Confidence Percentage:</strong> {analysis.confidence}</li>);
    }

    return info;
  };

  // Color schemes for the charts
  const patternColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a569bd'];
  const colorColors = ['#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#9b59b6'];
  const collarColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#95a5a6'];
  const sleeveColors = ['#d35400', '#8e44ad', '#16a085', '#c0392b'];
  const fitColors = ['#7f8c8d', '#e67e22', '#1abc9c', '#9b59b6'];
  const fabricColors = ['#2980b9', '#27ae60', '#f39c12', '#e74c3c', '#8e44ad', '#2c3e50', '#34495e'];

  const referredOptions = [
    { id: 'ref-fabricType', name: 'fabricType', label: 'FABRIC TYPE' },
    { id: 'ref-colours', name: 'colours', label: 'COLOURS' },
    { id: 'ref-printsPatterns', name: 'printsPatterns', label: 'PRINTS & PATTERNS' },
    { id: 'ref-collar', name: 'collar', label: 'COLLAR' },
    { id: 'ref-sleeve', name: 'sleeve', label: 'SLEEVE' },
    { id: 'ref-fit', name: 'fit', label: 'FIT' },
    { id: 'ref-gender', name: 'gender', label: 'GENDER' },
  ];

  const recommendedOptions = [
    { id: 'rec-fabricType', name: 'fabricType', label: 'FABRIC TYPE' },
    { id: 'rec-colours', name: 'colours', label: 'COLOURS' },
    { id: 'rec-printsPatterns', name: 'printsPatterns', label: 'PRINTS & PATTERNS' },
    { id: 'rec-collar', name: 'collar', label: 'COLLAR' },
    { id: 'rec-sleeve', name: 'sleeve', label: 'SLEEVE' },
    { id: 'rec-fit', name: 'fit', label: 'FIT' },
  ];

  return (
    <div className="inspiration-container">
      <h1 className="inspiration-header">INSPIRATION TEMPLATE</h1>
      <form onSubmit={handleSubmit} className="inspiration-form">
        <div className="form-sections">
          <div className="input-picture-section">
            <h2>INPUT PICTURE</h2>
            <div className="image-upload-wrapper">
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="imageUpload" className="image-upload-label">
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Preview" className="image-preview" />
                ) : (
                  <span>Click to Upload Image</span>
                )}
              </label>
            </div>
          </div>

          <div className="preferences-section">
            <h2>What should be referred from the image?</h2>
            {referredOptions.map(option => (
              <div key={option.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={option.id}
                  name={option.name}
                  checked={referredPreferences[option.name]}
                  onChange={handleReferredChange}
                />
                <label htmlFor={option.id}>{option.label}</label>
              </div>
            ))}
          </div>

          <div className="recommendations-section">
            <h2>What should be recommended from the image?</h2>
            {recommendedOptions.map(option => (
              <div key={option.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={option.id}
                  name={option.name}
                  checked={recommendedPreferences[option.name]}
                  onChange={handleRecommendedChange}
                />
                <label htmlFor={option.id}>{option.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'ANALYZING...' : 'SUBMIT'}
          </button>
        </div>
      </form>

      {analysisResult && (hasReferredPreferences() || hasRecommendedPreferences()) && (
        <div className="results-container">
          {/* Image Analysis Section - Only show if referred preferences are selected */}
          {hasReferredPreferences() && (
            <div className="analysis-results">
              <h2>Image Analysis</h2>
              
              {/* Basic Analysis Information */}
              <div className="basic-info">
                <ul>
                  {renderBasicAnalysisInfo()}
                </ul>
              </div>

              {/* Chart Section for Analysis */}
              <div className="charts-container">
                {/* Pattern Distribution Chart */}
                {referredPreferences.printsPatterns && analysisResult.analysis.patternDistribution && (
                  <div className="chart-section">
                    <h3>Pattern Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={convertToChartData(analysisResult.analysis.patternDistribution, patternColors)}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {convertToChartData(analysisResult.analysis.patternDistribution, patternColors).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Color Distribution Chart */}
                {referredPreferences.colours && analysisResult.analysis.colorDistribution && (
                  <div className="chart-section">
                    <h3>Color Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analysisResult.analysis.colorDistribution.map((item) => ({
                            name: item.pantoneShade || "Unknown",
                            value: item.percentage,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analysisResult.analysis.colorDistribution.map((item, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colorColors[index % colorColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations Section - Only show if recommended preferences are selected */}
          {hasRecommendedPreferences() && (
            <div className="recommendations-results">
              <h2>Recommendations for {analysisResult.analysis.garmentType}</h2>
              <p className="recommendation-intro">Based on Market competitor data extraction, here are our recommendations:</p>
              
              <div className="charts-container recommendation-charts">
                {/* Collar Distribution Chart */}
                {recommendedPreferences.collar && analysisResult.recommendations.collarDistribution && (
                  <div className="chart-section">
                    <h3>Collar Frequency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={convertToChartData(analysisResult.recommendations.collarDistribution, collarColors)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {convertToChartData(analysisResult.recommendations.collarDistribution, collarColors).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Sleeve Distribution Chart */}
                {recommendedPreferences.sleeve && analysisResult.recommendations.sleeveDistribution && (
                  <div className="chart-section">
                    <h3>Sleeve Frequency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={convertToChartData(analysisResult.recommendations.sleeveDistribution, sleeveColors)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {convertToChartData(analysisResult.recommendations.sleeveDistribution, sleeveColors).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Fit Distribution Chart */}
                {recommendedPreferences.fit && analysisResult.recommendations.fitDistribution && (
                  <div className="chart-section">
                    <h3>Fit Frequency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={convertToChartData(analysisResult.recommendations.fitDistribution, fitColors)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {convertToChartData(analysisResult.recommendations.fitDistribution, fitColors).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Pattern Distribution Chart for Recommendations */}
                {recommendedPreferences.printsPatterns && analysisResult.recommendations.patternDistribution && (
                  <div className="chart-section">
                    <h3>Pattern Frequency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={convertToChartData(analysisResult.recommendations.patternDistribution, patternColors)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {convertToChartData(analysisResult.recommendations.patternDistribution, patternColors).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Fabric Distribution Chart */}
                {recommendedPreferences.fabricType && analysisResult.recommendations.fabricDistribution && (
                  <div className="chart-section">
                    <h3>Fabric Frequency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={convertToChartData(analysisResult.recommendations.fabricDistribution, fabricColors)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {convertToChartData(analysisResult.recommendations.fabricDistribution, fabricColors).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Color Distribution Chart for Recommendations */}
                {recommendedPreferences.colours && analysisResult.recommendations.colorDistribution && (
                  <div className="chart-section">
                    <h3>Color Frequency</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analysisResult.recommendations.colorDistribution.map((item) => ({
                            name: item.pantoneShade || "Unknown",
                            value: item.percentage,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analysisResult.recommendations.colorDistribution.map((item, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={fitColors[index % fitColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show message if no preferences are selected but analysis result exists */}
      {analysisResult && !hasReferredPreferences() && !hasRecommendedPreferences() && (
        <div className="results-container">
          <div className="no-preferences-message">
            <h2>No Preferences Selected</h2>
            <p>Please select at least one preference from "What should be referred from the image?" or "What should be recommended from the image?" to view the analysis results.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspirationForm;