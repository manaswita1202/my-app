import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import hugoBossLogo1 from "./assets/hugobosslogo.png";
import "./Generatetc.css";
import ImageEditor from "./ImageAnnotation";

const Generatetc = () => {
  const [styleNo, setStyleNo] = useState("");
  const [buyer, setbuyer] = useState("");
  const [productType, setProductType] = useState("");
  const [category, setCategory] = useState("");
  const [fit, setFit] = useState("");
  const [size, setSize] = useState("M");
  const [generatedBy, setGeneratedBy] = useState("");
  const [flatSketch, setFlatSketch] = useState(null);
  const [image, setImage] = useState(null);
  const [imageFlatSketch, setImageFlatSketch] = useState(null);

  // Create refs for each section to be captured
  const headerRef = useRef(null);
  const flatSketchRef = useRef(null);
  const productDescRef = useRef(null);
  const pomRef = useRef(null);
  const trimsRef = useRef(null);
  const constructionRefs = useRef([]);

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

  // Helper function to capture construction details
  const captureConstructionDetails = async (index) => {
    const constructionElement = constructionRefs.current[index];
    if (constructionElement) {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(constructionElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        });
        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error capturing construction details:', error);
        return null;
      }
    }
    return null;
  };

  // New data-driven PDF export function
  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      
      let currentY = margin;
      const lineHeight = 7;
      const sectionSpacing = 15;

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredHeight) => {
        if (currentY + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      // Helper function to add header info
      const addHeader = () => {
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text("TECHPACK", pageWidth / 2, currentY, { align: 'center' });
        currentY += 15;

        // Basic info table
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        const headerData = [
          ['Style No.', styleNo, 'Buyer', buyer],
          ['Product Type', productType, 'Category', category],
          ['Fit', fit, 'Size', size],
          ['Generated Date', new Date().toLocaleDateString(), 'Generated By', generatedBy]
        ];

        const colWidth = contentWidth / 4;
        headerData.forEach((row, index) => {
          const y = currentY + (index * lineHeight);
          pdf.text(row[0] + ':', margin, y);
          pdf.text(row[1] || '', margin + colWidth, y);
          pdf.text(row[2] + ':', margin + (colWidth * 2), y);
          pdf.text(row[3] || '', margin + (colWidth * 3), y);
        });

        currentY += headerData.length * lineHeight + sectionSpacing;
      };

      // Add header to first page
      addHeader();

      // 1. Flat Sketch Section
      checkPageBreak(50);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("FLAT SKETCH", margin, currentY);
      currentY += 10;

      if (imageFlatSketch) {
        try {
          const imgWidth = 80;
          const imgHeight = 60;
          pdf.addImage(imageFlatSketch, 'JPEG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;
        } catch (error) {
          pdf.setFontSize(10);
          pdf.text("Flat sketch image could not be loaded", margin, currentY);
          currentY += 10;
        }
      } else {
        pdf.setFontSize(10);
        pdf.text("No flat sketch uploaded", margin, currentY);
        currentY += 10;
      }

      currentY += sectionSpacing;

      // 2. Product Description Section
      checkPageBreak(30 + (productRows.length * 8));
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("PRODUCT DESCRIPTION", margin, currentY);
      currentY += 10;

      // Product table
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      const productHeaders = ['Article', 'Code', 'Description', 'Color', 'Consumption', 'Placement'];
      const colWidths = [25, 25, 40, 25, 30, 25];
      
      // Draw headers
      let xPos = margin;
      productHeaders.forEach((header, index) => {
        pdf.text(header, xPos, currentY);
        xPos += colWidths[index];
      });
      currentY += 8;

      // Draw product rows
      pdf.setFont("helvetica", "normal");
      productRows.forEach((row) => {
        checkPageBreak(8);
        xPos = margin;
        const values = [row.article, row.articleCode, row.description, row.color, row.consumption, row.placement];
        values.forEach((value, index) => {
          pdf.text(value || '', xPos, currentY);
          xPos += colWidths[index];
        });
        currentY += 8;
      });

      currentY += sectionSpacing;

      // 3. Points of Measurement Section
      checkPageBreak(50);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("POINTS OF MEASUREMENT", margin, currentY);
      currentY += 10;

      // Add POM image if available
      if (image) {
        try {
          const imgWidth = 60;
          const imgHeight = 45;
          pdf.addImage(image, 'JPEG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;
        } catch (error) {
          pdf.setFontSize(10);
          pdf.text("POM image could not be loaded", margin, currentY);
          currentY += 10;
        }
      }

      // POM table
      checkPageBreak(20 + (pomRows.length * 8));
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      const pomHeaders = ['POM', 'S', 'M', 'L', 'XL', 'XXL', 'Tolerance'];
      const pomColWidths = [40, 20, 20, 20, 20, 20, 25];
      
      // Draw POM headers
      xPos = margin;
      pomHeaders.forEach((header, index) => {
        pdf.text(header, xPos, currentY);
        xPos += pomColWidths[index];
      });
      currentY += 8;

      // Draw POM rows
      pdf.setFont("helvetica", "normal");
      pomRows.forEach((row) => {
        checkPageBreak(8);
        xPos = margin;
        const values = [row.pom, row.S, row.M, row.L, row.XL, row.XXL, row.tolerance];
        values.forEach((value, index) => {
          pdf.text(value || '', xPos, currentY);
          xPos += pomColWidths[index];
        });
        currentY += 8;
      });

      currentY += sectionSpacing;

      // 4. Trims Section
      checkPageBreak(30 + (trimsRows.length * 30)); // Increased space for images
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("TRIMS CARD", margin, currentY);
      currentY += 10;

      // Process each trim row individually to handle images
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      
      // Draw header once
      const trimsHeaders = ['S.No', 'Trims', 'Size', 'Description', 'Qty', 'Color', 'Sample'];
      const trimsColWidths = [15, 25, 20, 35, 15, 20, 30];
      
      xPos = margin;
      trimsHeaders.forEach((header, index) => {
        pdf.text(header, xPos, currentY);
        xPos += trimsColWidths[index];
      });
      currentY += 8;

      // Draw trims rows with images
      pdf.setFont("helvetica", "normal");
      
      for (let i = 0; i < trimsRows.length; i++) {
        const row = trimsRows[i];
        const rowHeight = row.sample ? 25 : 8; // More height if there's an image
        
        checkPageBreak(rowHeight);
        
        const startY = currentY;
        xPos = margin;
        
        // Text content
        const values = [
          (i + 1).toString(),
          row.merged ? row.trimType : row.trimName,
          row.merged ? '' : row.size,
          row.merged ? '' : row.description,
          row.merged ? '' : row.qty,
          row.merged ? '' : row.color
        ];
        
        values.forEach((value, colIndex) => {
          pdf.text(value || '', xPos, startY + 5);
          xPos += trimsColWidths[colIndex];
        });

        // Add sample image if available
        if (row.sample && !row.merged) {
          try {
            const imgWidth = 25;
            const imgHeight = 20;
            pdf.addImage(row.sample, 'JPEG', xPos, startY, imgWidth, imgHeight);
          } catch (error) {
            pdf.setFontSize(8);
            pdf.text("Image error", xPos, startY + 5);
            pdf.setFontSize(9);
          }
        }
        
        currentY += rowHeight;
      }

      // 5. Construction Details - Capture actual content from ImageEditor
      for (let i = 0; i < constructionPages.length; i++) {
        pdf.addPage();
        currentY = margin;
        
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(`CONSTRUCTION DETAILS - PAGE ${i + 1}`, margin, currentY);
        currentY += 20;
        
        // Try to capture the construction details
        const constructionImage = await captureConstructionDetails(i);
        
        if (constructionImage) {
          try {
            const imgWidth = contentWidth;
            const imgHeight = (contentWidth * 3) / 4; // Maintain aspect ratio
            
            // Check if image fits on current page
            if (currentY + imgHeight > pageHeight - margin) {
              pdf.addPage();
              currentY = margin;
            }
            
            pdf.addImage(constructionImage, 'PNG', margin, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 10;
          } catch (error) {
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text("Construction details could not be captured", margin, currentY);
            currentY += 10;
          }
        } else {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.text("Construction details section - content will be displayed here", margin, currentY);
          pdf.text("This section includes technical drawings and construction notes", margin, currentY + 10);
          currentY += 30;
        }
      }

      // Save the PDF
      pdf.save("TechPack.pdf");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Check console for details.");
    }
  };

  return (
    <div className="techpack1-container">
      {/* Header Template - This will be used as a reference for each page */}
      <div className="techpack1-header" ref={headerRef}>
        <table className="techpack1-table">
          <thead>
            <tr>
              <th colSpan={4} className="title">
                Techpack
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Style No.</td>
              <td><input type="text" value={styleNo} onChange={(e) => setStyleNo(e.target.value)} /></td>
              <td>Buyer</td>
              <td><input type="text" value={buyer} onChange={(e) => setbuyer(e.target.value)} /></td>
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
      </div>

      {/* Page 1 - Flat Sketch Section */}
      <div className="techpack1-page" ref={flatSketchRef}>
        <div className="flat-sketch-section">
          <h3>Flat Sketch</h3>
          <div className="border p-4 flex flex-col items-center">
            <input type="file" accept="image/*" onChange={handleImageUploadFlatsketch} className="mb-4" />
            {imageFlatSketch && <img src={imageFlatSketch} alt="Flat Sketch" className="sketch-img" />}
          </div>
        </div>
      </div>

      {/* Page 2 - Product Description Section */}
      <div className="techpack1-page" ref={productDescRef}>
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
      <div className="techpack1-page" ref={pomRef}>
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
      <div className="techpack1-page" ref={trimsRef}>
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
        <div 
          key={index} 
          className="construction-page techpack1-page"
          ref={el => constructionRefs.current[index] = el}
        >
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
            {[1].map((section) => (
              <div key={section} className="construction-box">
                <ImageEditor />
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