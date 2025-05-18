import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './InspirationForm.css'; // We'll create this CSS file next

const InspirationForm = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

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
    const formData = new FormData();
    formData.append("image", selectedImage);
  
    try {
      const response = await fetch("https://samplify-backend-production.up.railway.app/analyze-image", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Check the console.");
    }
  };

  const handleReverseImageSearch = () => {
    if (selectedImage) {
      // Method 1: Upload to a temporary image hosting service and search
      const uploadAndSearch = async () => {
        try {
          // Convert to base64 for URL encoding
          const reader = new FileReader();
          reader.onload = function(e) {
            const base64Data = e.target.result;
            // Create Google Images search URL with the base64 data
            const searchUrl = `https://www.google.com/searchbyimage?image_url=data:image/jpeg;base64,${base64Data.split(',')[1]}`;
            window.open(searchUrl, '_blank');
          };
          reader.readAsDataURL(selectedImage);
        } catch (error) {
          console.error('Error with reverse image search:', error);
          // Fallback: Open Google Images upload page
          window.open('https://images.google.com/', '_blank');
          alert('Please use the camera icon on Google Images to upload your image manually.');
        }
      };

      uploadAndSearch();
    } else {
      alert('Please select an image first');
    }
  };

  // Alternative method: Upload to imgbb and then search
  const handleReverseImageSearchAlternative = async () => {
    if (selectedImage) {
      try {
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = async function(e) {
          const base64Data = e.target.result.split(',')[1];
          
          // Upload to imgbb (you'll need an API key from imgbb.com)
          const imgbbApiKey = 'YOUR_IMGBB_API_KEY'; // Get this from imgbb.com
          
          if (imgbbApiKey && imgbbApiKey !== 'YOUR_IMGBB_API_KEY') {
            const formData = new FormData();
            formData.append('image', base64Data);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
              method: 'POST',
              body: formData
            });
            
            const data = await response.json();
            if (data.success) {
              const imageUrl = data.data.url;
              const searchUrl = `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imageUrl)}`;
              window.open(searchUrl, '_blank');
            } else {
              throw new Error('Failed to upload image');
            }
          } else {
            // Fallback: Direct method using lens.google.com
            const blob = new Blob([selectedImage], { type: selectedImage.type });
            const imageUrl = URL.createObjectURL(blob);
            
            // Open Google Lens (works better for uploads)
            window.open('https://lens.google.com/', '_blank');
            alert('Please drag and drop your image to Google Lens, or use the upload option.');
          }
        };
        reader.readAsDataURL(selectedImage);
      } catch (error) {
        console.error('Error with reverse image search:', error);
        window.open('https://images.google.com/', '_blank');
        alert('Please use the camera icon on Google Images to upload your image manually.');
      }
    } else {
      alert('Please select an image first');
    }
  };

  // Function to convert object data to chart format
  const convertToChartData = (data, colors) => {
    return Object.entries(data)
      .filter(([key, value]) => value > 0) // Only include items with values > 0
      .map(([key, value], index) => ({
        name: key,
        value: value,
        fill: colors[index % colors.length]
      }));
  };

  // Color schemes for the charts
  const patternColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];
  const colorColors = ['#0088fe', '#00c49f', '#ffbb28', '#ff8042'];

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
    { id: 'rec-gender', name: 'gender', label: 'GENDER' },
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
          <button type="submit" className="submit-button">SUBMIT</button>
          {selectedImage && (
            <>
              <button 
                type="button" 
                onClick={handleReverseImageSearch}
                className="reverse-search-button"
              >
                Search on Google Images
              </button>
              <button 
                type="button" 
                onClick={handleReverseImageSearchAlternative}
                className="reverse-search-button alt"
              >
                Search on Google Lens
              </button>
            </>
          )}
        </div>
      </form>

      {analysisResult && (
        <div className="analysis-results">
          <h2>Analysis Results</h2>
          
          {/* Basic Analysis Information */}
          <div className="basic-info">
            <ul>
              <li><strong>Garment Type:</strong> {analysisResult.garmentType}</li>
              <li><strong>Pattern:</strong> {analysisResult.pattern}</li>
              <li><strong>Colour:</strong> {analysisResult.color}</li>
              <li><strong>Fit:</strong> {analysisResult.fit}</li>
              <li><strong>Style:</strong> {analysisResult.style}</li>
              <li><strong>Collar Type:</strong> {analysisResult.collarType}</li>
              <li><strong>Gender:</strong> {analysisResult.gender}</li>
            </ul>
          </div>

          {/* Chart Section */}
          <div className="charts-container">
            {/* Pattern Distribution Chart */}
            {analysisResult.patternDistribution && (
              <div className="chart-section">
                <h3>Pattern Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={convertToChartData(analysisResult.patternDistribution, patternColors)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {convertToChartData(analysisResult.patternDistribution, patternColors).map((entry, index) => (
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
            {analysisResult.colorDistribution && (
              <div className="chart-section">
                <h3>Color Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={convertToChartData(analysisResult.colorDistribution, colorColors)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {convertToChartData(analysisResult.colorDistribution, colorColors).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
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
  );
};

export default InspirationForm;