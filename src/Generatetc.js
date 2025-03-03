import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import hugoBossLogo1 from "./assets/hugobosslogo.png";
import "./Generatetc.css";

const Generatetc = () => {
  const [styleNo, setStyleNo] = useState("");
  const [season, setSeason] = useState("");
  const [productType, setProductType] = useState("");
  const [category, setCategory] = useState("");
  const [fit, setFit] = useState("");
  const [size, setSize] = useState("M");
  const [generatedBy, setGeneratedBy] = useState("");
  const [flatSketch, setFlatSketch] = useState(null);
  const [image, setImage] = useState(null);
  const [imageFlatSketch, setImageFlatSketch] = useState(null);

  const pdfRef = useRef(null); // Make sure ref is initialized properly

  const [productRows, setProductRows] = useState([
    { article: "", articleCode: "", description: "", color: "", consumption: "", placement: "" },
  ]);

  const [pomRows, setPomRows] = useState([
    { pom: "", S: "", M: "", L: "", XL: "", XXL: "", tolerance: "± 0.25" },
  ]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageUploadFlatsketch = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFlatSketch(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input change in the product table
  const handleProductChange = (index, field, value) => {
    const newRows = [...productRows];
    newRows[index][field] = value;
    setProductRows(newRows);
  };

  // Add a new row in the product table
  const addProductRow = () => {
    setProductRows([...productRows, { article: "", articleCode: "", description: "", color: "", consumption: "", placement: "" }]);
  };

  // Remove a row from the product table
  const removeProductRow = (index) => {
    if (productRows.length > 1) {
      setProductRows(productRows.filter((_, i) => i !== index));
    }
  };

  const handlePomChange = (index, field, value) => {
    const updatedRows = [...pomRows];
    updatedRows[index][field] = value;
    setPomRows(updatedRows);
  };


  const addPomRow = () => {
    setPomRows([...pomRows, { pom: "", S: "", M: "", L: "", XL: "", XXL: "", tolerance: "± 0.25" }]);
  };

  const removePomRow = (index) => {
    if (pomRows.length > 1) {
      setPomRows(pomRows.filter((_, i) => i !== index));
    }
  };

  const [trimsRows, setTrimsRows] = useState([
    { trimType: "Labels", trimName: "", size: "", description: "", qty: "", color: "", sample: null, merged: false },
  ]);

  const handleTrimsChange = (index, field, value) => {
    const updatedRows = [...trimsRows];
    updatedRows[index][field] = value;
    setTrimsRows(updatedRows);
  };

  const handleTrimsSampleUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedRows = [...trimsRows];
        updatedRows[index].sample = reader.result;
        setTrimsRows(updatedRows);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTrimsRow = () => {
    setTrimsRows([...trimsRows, { trimType: "Labels", trimName: "", size: "", description: "", qty: "", color: "", sample: null, merged: false }]);
  };

  const removeTrimsRow = (index) => {
    if (trimsRows.length > 1) {
      setTrimsRows(trimsRows.filter((_, i) => i !== index));
    }
  };

  const toggleMerge = (index) => {
    const updatedRows = [...trimsRows];
    updatedRows[index].merged = !updatedRows[index].merged;
    setTrimsRows(updatedRows);
  };

  const [constructionPages, setConstructionPages] = useState([1]);

  const addPage = () => {
    setConstructionPages([...constructionPages, constructionPages.length + 1]);
  };

  const deletePage = (index) => {
    if (constructionPages.length > 1) {
      setConstructionPages(constructionPages.filter((_, i) => i !== index));
    }
  };

  // Export all pages as PDF - FIXED FUNCTION
  const exportToPDF = () => {
    if (!pdfRef.current) {
      console.error("PDF reference is not attached to any element");
      return;
    }

    const input = pdfRef.current;
    
    // Use a promise chain for better error handling
    html2canvas(input, { 
      scale: 2,
      logging: true, // For debugging
      useCORS: true, // For images with CORS issues
      allowTaint: true // For tainted images
    })
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add more pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save("TechPack.pdf");
    })
    .catch(error => {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Check console for details.");
    });
  };

  return (
    // Attach the ref to the top-level container
    <div className="techpack1-container" ref={pdfRef}>
      {/* Page 1 - Header + Flat Sketch Section */}
      <div className="techpack1-page">
        <table className="techpack1-table">
          <thead>
            <tr>
              <th colSpan={4} className="title">
                <span className="brand-logo">
                  <img src={hugoBossLogo1} alt="Hugo Boss Logo" className="logo-img" />
                </span>
                Techpack
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Style No.</td>
              <td><input type="text" value={styleNo} onChange={(e) => setStyleNo(e.target.value)} /></td>
              <td>Season</td>
              <td><input type="text" value={season} onChange={(e) => setSeason(e.target.value)} /></td>
            </tr>
            <tr>
              <td>Product Type</td>
              <td><input type="text" value={productType} onChange={(e) => setProductType(e.target.value)} /></td>
              <td>Category</td>
              <td><input type="text" value={category} onChange={(e) => setCategory(e.target.value)} /></td>
            </tr>
            <tr>
              <td>Fit</td>
              <td><input type="text" value={fit} onChange={(e) => setFit(e.target.value)} /></td>
              <td>Size</td>
              <td>
                <select value={size} onChange={(e) => setSize(e.target.value)}>
                  {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>Generated Date</td>
              <td><input type="text" value={new Date().toLocaleDateString()} readOnly /></td>
              <td>Generated By</td>
              <td><input type="text" value={generatedBy} onChange={(e) => setGeneratedBy(e.target.value)} /></td>
            </tr>
          </tbody>
        </table>

        <div className="flat-sketch-section">
          <h3>Flat Sketch</h3>
          <div className="border p-4 flex flex-col items-center">
            <input type="file" accept="image/*" onChange={handleImageUploadFlatsketch} className="mb-4" />
            {imageFlatSketch && <img src={imageFlatSketch} alt="Flat Sketch" className="sketch-img" />}
          </div>
        </div>
      </div>

      {/* Page 2 - Product Description Section */}
      <div className="techpack1-page">
        <h3 className="section-title">Product Description</h3>
        <table className="product-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Article Code</th>
              <th>Description</th>
              <th>Color</th>
              <th>Consumption</th>
              <th>Placement</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {productRows.map((row, index) => (
              <tr key={index}>
                <td><input type="text" value={row.article} onChange={(e) => handleProductChange(index, "article", e.target.value)} /></td>
                <td><input type="text" value={row.articleCode} onChange={(e) => handleProductChange(index, "articleCode", e.target.value)} /></td>
                <td><input type="text" value={row.description} onChange={(e) => handleProductChange(index, "description", e.target.value)} /></td>
                <td><input type="text" value={row.color} onChange={(e) => handleProductChange(index, "color", e.target.value)} /></td>
                <td><input type="text" value={row.consumption} onChange={(e) => handleProductChange(index, "consumption", e.target.value)} /></td>
                <td><input type="text" value={row.placement} onChange={(e) => handleProductChange(index, "placement", e.target.value)} /></td>
                <td>
                  <button className="remove-btn" onClick={() => removeProductRow(index)}>✖</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-btn" onClick={addProductRow}>+ Add Row</button>
      </div>

      {/* POM section */}
      <div className="techpack1-page">
        <h3 className="section-title">Points of Measurement</h3>
        <div className="pom-container">
          {/* Image Upload */}
          <div className="pom-image-container">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
            {image && <img src={image} alt="Measurement Points" className="pom-img" />}
          </div>
          
          {/* POM Table */}
          <div className="pom-table-container">
            <table className="pom-table">
              <thead>
                <tr>
                  <th>POM</th>
                  <th>S</th>
                  <th>M</th>
                  <th>L</th>
                  <th>XL</th>
                  <th>XXL</th>
                  <th>Tolerance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pomRows.map((row, index) => (
                  <tr key={index}>
                    <td><input type="text" value={row.pom} onChange={(e) => handlePomChange(index, "pom", e.target.value)} /></td>
                    <td><input type="text" value={row.S} onChange={(e) => handlePomChange(index, "S", e.target.value)} /></td>
                    <td><input type="text" value={row.M} onChange={(e) => handlePomChange(index, "M", e.target.value)} /></td>
                    <td><input type="text" value={row.L} onChange={(e) => handlePomChange(index, "L", e.target.value)} /></td>
                    <td><input type="text" value={row.XL} onChange={(e) => handlePomChange(index, "XL", e.target.value)} /></td>
                    <td><input type="text" value={row.XXL} onChange={(e) => handlePomChange(index, "XXL", e.target.value)} /></td>
                    <td>
                      <select value={row.tolerance} onChange={(e) => handlePomChange(index, "tolerance", e.target.value)}>
                        <option>± 0.25</option>
                        <option>± 0.5</option>
                        <option>± 0.75</option>
                        <option>± 1</option>
                      </select>
                    </td>
                    <td>
                      <button className="remove-btn" onClick={() => removePomRow(index)}>✖</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="add-row-btn" onClick={addPomRow}>+ Add Row</button>
          </div>
        </div>
      </div>

      {/* PAGE 4: TRIMS CARD */}
      <div className="techpack1-page">
        <h3 className="section-title">Trims Card</h3>
        <table className="trims-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Trims</th>
              <th>Size</th>
              <th>Description</th>
              <th>Qty Required</th>
              <th>Color</th>
              <th>Sample</th>
              <th>Merge</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {trimsRows.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                {row.merged ? (
                  <td colSpan="6">
                    <select
                      value={row.trimType}
                      onChange={(e) => handleTrimsChange(index, "trimType", e.target.value)}
                    >
                      <option>Labels</option>
                      <option>Buttons</option>
                      <option>Tags</option>
                      <option>Others</option>
                    </select>
                  </td>
                ) : (
                  <>
                    <td>
                      <input
                        type="text"
                        value={row.trimName}
                        onChange={(e) => handleTrimsChange(index, "trimName", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.size}
                        onChange={(e) => handleTrimsChange(index, "size", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleTrimsChange(index, "description", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.qty}
                        onChange={(e) => handleTrimsChange(index, "qty", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.color}
                        onChange={(e) => handleTrimsChange(index, "color", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleTrimsSampleUpload(index, e)}
                      />
                      {row.sample && (
                        <img src={row.sample} alt="Sample" className="sample-img" />
                      )}
                    </td>
                  </>
                )}
                <td>
                  <input
                    type="checkbox"
                    checked={row.merged}
                    onChange={() => toggleMerge(index)}
                  />
                </td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => removeTrimsRow(index)}
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addTrimsRow} className="add-row-btn">
          + Add Row
        </button>
      </div>

      {/* Construction Details Pages */}
      {constructionPages.map((page, index) => (
        <div key={index} className="construction-page techpack1-page">
          <div className="page-header">
            <h2>Construction Details - Page {index + 1}</h2>
            <div className="page-actions">
              <button className="add-page-btn" onClick={addPage}>+ Add Page</button>
              {constructionPages.length > 1 && (
                <button className="delete-page-btn" onClick={() => deletePage(index)}>🗑 Delete Page</button>
              )}
            </div>
          </div>

          <div className="construction-section">
            {[1, 2, 3, 4].map((section) => (
              <div key={section} className="construction-box">
                <input type="file" accept="image/*" className="image-upload" />
                <textarea className="comment-box" placeholder="Add comments..."></textarea>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Export to PDF Button */}
      <div className="export-container">
        <button className="export-btn" onClick={exportToPDF}>📄 Export as PDF</button>
      </div>
    </div>
  );
};

export default Generatetc;