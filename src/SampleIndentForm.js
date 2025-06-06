import React, { useState, useEffect } from "react";
import Select from "react-select";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./SampleIndentForm.css";
import { useOutletContext } from "react-router-dom";

// Sample data for dropdowns
const sampleTypes = [
  { value: "PP", label: "PP" },
  { value: "Proto", label: "Proto" },
  { value: "Fit Sample", label: "Fit" },
  { value: "SMS", label: "SMS" },
  { value: "Photoshoot", label: "Photoshoot" },
];

const SampleIndentForm = () => {
  const { styleData, setStyleData, activeStyleIndex, setActiveStyleIndex } = useOutletContext(); // Get from Layout

  const [formData, setFormData] = useState({
    receivedDate: "",
    receivedBy: "",
    stitchingLine: "",
    totalQuantity: "",
    shadeCombo: "",
    sampleType: "",
    patternNumber: "",
    fabricDiscussion: "",
    season: "",
    mainBodyFabric: "",
    collarCuffFabric: "",
    mainLabel: "",
    sizeLabel: "",
    sleeveLabel: "",
    chestBadge: "",
    drawcord: "",
    buttons: "",
    studs: "",
    threadShade: "",
    sewingThread: "",
    sewingThreadDetail: "",
  });

  function extractThreadInfoFromBOM(bom) {
    let sewingThread = "";
    let sewingThreadDetail = "";
    
    if (bom && bom.trims && Array.isArray(bom.trims)) {
      const threadTrims = bom.trims.filter(trimItem =>
        trimItem.trim && typeof trimItem.trim === 'string' &&
        trimItem.trim.toLowerCase().includes("thread")
      );
      
      sewingThreadDetail = threadTrims.map(item => item.description).join(", ");
      sewingThread = threadTrims.map(item => item.code).join(", ");
    }
  
    return { sewingThread, sewingThreadDetail };
  }
  

  useEffect(() => {
    if (styleData && activeStyleIndex !== null && styleData[activeStyleIndex]) {
      const activeStyle = styleData[activeStyleIndex];
      console.log(activeStyle);
      const { sewingThread, sewingThreadDetail } = extractThreadInfoFromBOM(activeStyle?.techpackData?.bom);
      setFormData(prevFormData => ({
        ...prevFormData,
        receivedDate: activeStyle?.orderReceivedDate || "",
        totalQuantity: activeStyle?.quantity || "",
        shadeCombo: activeStyle?.techpackData?.shade || "",
        season: activeStyle?.techpackData?.season || "",
        mainBodyFabric: activeStyle?.techpackData?.mainBodyFabric || "",
        mainLabel: activeStyle?.techpackData?.mainLabel || "",
        threadShade: activeStyle?.techpackData?.threadShade || "",
        sewingThread: sewingThread || "",
        sewingThreadDetail: sewingThreadDetail || "",
        patternNumber: activeStyle?.styleNumber || "",
        stitchingLine: activeStyle?.garment || "",
        sampleType: activeStyle?.sampleType || "",
      }));
    }
  }, [styleData, activeStyleIndex]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Helper function to check if a value is non-empty
  const isNonEmpty = (value) => {
    return value && value.toString().trim() !== "";
  };

  // Helper function to render field only if it has a value
  const renderFieldIfNonEmpty = (label, value, includeBox = false) => {
    if (!isNonEmpty(value)) return null;
    
    if (includeBox) {
      return (
        <div key={label} style={{ display: "contents" }}>
          <p><b>{label}:</b> {value}</p>
          <div style={{ width: "120px", height: "100px", border: "2px solid #000" }}></div>
        </div>
      );
    }
    
    return <p key={label}><b>{label}:</b> {value}</p>;
  };

  const generatePDF = () => {
    const input = document.getElementById("indent-form");
    
    // Make sure the hidden form is visible for capturing
    if (input) {
      // First make it visible
      const originalDisplay = input.style.display;
      input.style.display = "block";

      const a4Width = 210; // A4 width in mm
      const a4Height = 297; // A4 height in mm
      const scale = 2; // Scale factor for better resolution

      html2canvas(input, { scale }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        // Calculate dimensions to fit the A4 page
        const pdfWidth = a4Width;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (pdfHeight <= a4Height) {
          // Content fits within a single page
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        } else {
          // Content exceeds one page, split into multiple pages
          let position = 0;
          const pageHeightInPx = (a4Height * canvas.width) / a4Width; // A4 height in pixels based on canvas width

          while (position < canvas.height) {
            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(canvas.height - position, pageHeightInPx);

            const pageContext = pageCanvas.getContext("2d");
            pageContext.drawImage(
              canvas,
              0,
              position,
              canvas.width,
              pageCanvas.height,
              0,
              0,
              pageCanvas.width,
              pageCanvas.height
            );

            const pageImgData = pageCanvas.toDataURL("image/png");
            const pageHeightInMm = (pageCanvas.height * a4Width) / canvas.width; // Maintain aspect ratio
            pdf.addImage(pageImgData, "PNG", 0, 0, pdfWidth, pageHeightInMm);

            position += pageCanvas.height;

            if (position < canvas.height) {
              pdf.addPage();
            }
          }
        }

        pdf.save("sample_indent_form.pdf");
        
        // Reset the display property to its original value
        input.style.display = originalDisplay;
      }).catch(error => {
        console.error("Error generating PDF:", error);
        input.style.display = originalDisplay;
      });
    }
  };

  // Get non-empty basic fields
  const basicFields = [
    { label: "Received Date", value: formData.receivedDate },
    { label: "Received By", value: formData.receivedBy },
    { label: "Garment", value: formData.stitchingLine },
    { label: "Total Quantity of Pieces", value: formData.totalQuantity },
    { label: "Shade/Combo", value: formData.shadeCombo },
    { label: "Sample Type", value: formData.sampleType },
    { label: "Style Number", value: formData.patternNumber },
    { label: "Size", value: formData.fabricDiscussion },
  ].filter(field => isNonEmpty(field.value));

  // Get non-empty fabric & trim fields with boxes
  const fabricTrimFieldsWithBoxes = [
    { label: "Main Body Fabric", value: formData.mainBodyFabric },
    { label: "Collar/Cuff Fabric", value: formData.collarCuffFabric },
    { label: "Main Label and other trims", value: formData.mainLabel },
    { label: "Thread Shade", value: formData.threadShade },
  ].filter(field => isNonEmpty(field.value));

  // Get non-empty thread details
  const threadFields = [
    { label: "Sewing Thread Code", value: formData.sewingThreadDetail },
    { label: "Sewing Thread Details", value: formData.sewingThread },
  ].filter(field => isNonEmpty(field.value));

  // Check if we have any fabric & trim content to show
  const hasFabricTrimContent = fabricTrimFieldsWithBoxes.length > 0 || threadFields.length > 0;

  return (
    <div className="container">
      <h2>Sample Indent Form</h2>
      <div className="form-section">
        <h3>To Fill</h3>
        <label>Received Date:</label>
        <input 
          type="date" 
          onChange={(e) => handleInputChange("receivedDate", e.target.value)} 
          value={formData.receivedDate} 
        />

        <label>Received By:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("receivedBy", e.target.value)} 
          value={formData.receivedBy} 
        />

        <label>Garment:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("stitchingLine", e.target.value)} 
          value={formData.stitchingLine} 
        />

        <label>Total Quantity of Pieces:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("totalQuantity", e.target.value)} 
          value={formData.totalQuantity} 
        />

        <label>Shade/Combo:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("shadeCombo", e.target.value)} 
          value={formData.shadeCombo} 
        />

        <label>Sample Type:</label>
        <Select
          options={sampleTypes}
          onChange={(option) => handleInputChange("sampleType", option.value)}
          value={sampleTypes.find(option => option.value === formData.sampleType)}
        />

        <label>Style Number:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("patternNumber", e.target.value)} 
          value={formData.patternNumber} 
        />

        <label>Size:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("fabricDiscussion", e.target.value)} 
          value={formData.fabricDiscussion} 
        />
      </div>

      <div className="form-section">
        <h3>Default</h3>
        <p>Contact Name: Mr. Yagappan</p>
        <label>Season:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("season", e.target.value)} 
          value={formData.season} 
        />
        <p>Category: Men</p>
        <p>Fabric Qty: 1 KG</p>
        <p>Checked By: Devraj</p>
      </div>

      <div className="form-section">
        <h3>Fabric & Trim Details</h3>
        <label>Main Body Fabric:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("mainBodyFabric", e.target.value)} 
          value={formData.mainBodyFabric} 
        />

        <label>Collar/Cuff Fabric:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("collarCuffFabric", e.target.value)} 
          value={formData.collarCuffFabric} 
        />

        <label>Main Label:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("mainLabel", e.target.value)} 
          value={formData.mainLabel} 
        />

        <label>Thread Shade:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("threadShade", e.target.value)} 
          value={formData.threadShade} 
        />

        <label>Sewing Thread Code:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("sewingThread", e.target.value)} 
          value={formData.sewingThread} 
        />

        <label>Sewing Thread Details:</label>
        <input 
          type="text" 
          onChange={(e) => handleInputChange("sewingThreadDetail", e.target.value)} 
          value={formData.sewingThreadDetail} 
        />
      </div>

      <button onClick={generatePDF}>Download PDF</button>

      {/* Hidden form for PDF generation */}
      <div 
        id="indent-form" 
        style={{ 
          display: "none", 
          padding: "40px", 
          fontFamily: "Arial, sans-serif", 
          border: "2px solid #000", 
          borderRadius: "10px", 
          backgroundColor: "#fff",
          width: "210mm", // A4 width
          minHeight: "297mm", // A4 height
          margin: "0 auto"
        }}
      >
        {/* Company Logo */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img src="arvind.png" alt="Company Logo" style={{ maxWidth: "100px" }} />
        </div>

        {/* Heading */}
        <h2 style={{ 
          textAlign: "center", 
          marginBottom: "30px", 
          fontWeight: "bold", 
          fontSize: "24px" 
        }}>
          Sample Indent Form
        </h2>

        {/* Form Data - Only show non-empty fields */}
        {basicFields.length > 0 && (
          <div style={{ marginBottom: "20px", lineHeight: "1.6" }}>
            {basicFields.map(field => renderFieldIfNonEmpty(field.label, field.value))}
          </div>
        )}

        {/* Default section with season if available */}
        <div style={{ marginBottom: "20px", lineHeight: "1.6" }}>
          <p><b>Contact Name:</b> Mr. Yagappan</p>
          {isNonEmpty(formData.season) && <p><b>Season:</b> {formData.season}</p>}
          <p><b>Category:</b> Men</p>
          <p><b>Fabric Qty:</b> 1 KG</p>
          <p><b>Checked By:</b> Devraj</p>
        </div>

        {/* Fabric & Trim Details - Only show if there's content */}
        {hasFabricTrimContent && (
          <>
            <h3 style={{ 
              marginBottom: "20px", 
              borderBottom: "2px solid crimson", 
              paddingBottom: "5px", 
              color: "crimson" 
            }}>
              Fabric & Trim Details
            </h3>

            {/* Grid Section - Only show fields with values */}
            {fabricTrimFieldsWithBoxes.length > 0 && (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "2fr 1fr", 
                gap: "30px", 
                alignItems: "center", 
                marginBottom: "20px" 
              }}>
                {fabricTrimFieldsWithBoxes.map(field => 
                  renderFieldIfNonEmpty(field.label, field.value, true)
                )}
              </div>
            )}

            {/* Thread Details - Only show if there are thread fields */}
            {threadFields.length > 0 && (
              <div style={{ marginBottom: "30px" }}>
                {threadFields.map(field => renderFieldIfNonEmpty(field.label, field.value))}
              </div>
            )}
          </>
        )}

        <div style={{ pageBreakBefore: "always" }}></div>

        {/* Signature Section */}
        <div style={{ marginTop: "40px" }}>
          <h3>Signature</h3>
          <div style={{ width: "100%", height: "60px", marginTop: "30px" }}></div>
          <p style={{ textAlign: "right", marginTop: "5px" }}><i>Authorized Signatory</i></p>
        </div>
      </div>
    </div>
  );
};

export default SampleIndentForm;