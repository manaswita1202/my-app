import React, { useState } from "react";
import Select from "react-select";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./SampleIndentForm.css";
import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";
// Sample data for dropdowns
const stitchingLines = [
  { value: "Line 1", label: "Line 1" },
  { value: "Line 2", label: "Line 2" },
];

const sampleTypes = [
  { value: "PP", label: "PP" },
  { value: "Proto", label: "Proto" },
  { value: "Fit", label: "Fit" },
  { value: "SMS", label: "SMS" },
  { value: "Photoshoot", label: "Photoshoot" },
];

const totalPieces = [
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
];

const fabricOptions = [
  { value: "Cotton", label: "Cotton" },
  { value: "Polyester", label: "Polyester" },
  { value: "Denim", label: "Denim" },
];

const labelOptions = [
  { value: "Standard Label", label: "Standard Label" },
  { value: "Premium Label", label: "Premium Label" },
];

const threadShades = [
  { value: "Contrast", label: "Contrast" },
  { value: "Similar", label: "Similar" },
];

const sewingThreads = [
  { value: "TCX Red", label: "TCX Red" },
  { value: "TCX Blue", label: "TCX Blue" },
];

const sewingThreadDetails = [
  { value: "Shade 10", label: "Shade 10" },
  { value: "Shade 20", label: "Shade 20" },
];

const SampleIndentForm = () => {
  const { styleData, setStyleData,activeStyleIndex, setActiveStyleIndex } = useOutletContext(); // Get from Layout

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

      useEffect(() => {
        
        if (styleData && activeStyleIndex !== null && styleData[activeStyleIndex]) {
          const activeStyle = styleData[activeStyleIndex];
          console.log(activeStyle)
          setFormData(prevFormData => ({
            ...prevFormData,
            receivedDate: activeStyle?.orderReceivedDate || "",
            totalQuantity: activeStyle?.quantity || "",
            shadeCombo: activeStyle?.techpackData?.shade,
            season: activeStyle?.techpackData?.season,
            mainBodyFabric: activeStyle?.techpackData?.mainBodyFabric,
            mainLabel: activeStyle?.techpackData?.mainLabel,
            threadShade: activeStyle?.techpackData?.threadShade,
            sewingThread: activeStyle?.techpackData?.sweingThreads,
            sewingThreadDetail: activeStyle?.techpackData?.sweingThreadsDetails,
            patternNumber : activeStyle?.techpackData?.patternNo
        
          }));
        }
      }, [styleData, activeStyleIndex]);
  

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const generatePDF = () => {
    const input = document.getElementById("indent-form");
  
    // Ensure it's visible before capture
    input.style.display = "block";
  
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
  
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("sample_indent_form.pdf");
  
      // Hide it again
      input.style.display = "none";
    });  
  
  
    // Temporarily show the hidden element
    input.style.display = "block";
  
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      
      // Adjust dimensions for better fit
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("sample_indent_form.pdf");
  
      // Hide it again after capturing
      input.style.display = "none";
    });
  };
    return (
    <div className="container">
      <h2>Sample Indent Form</h2>
      <div className="form-section">
        <h3>To Fill</h3>
        <label>Received Date:</label>
        <input type="date" onChange={(e) => handleInputChange("receivedDate", e.target.value)} value={formData.receivedDate} />

        <label>Received By:</label>
        <input type="text" onChange={(e) => handleInputChange("receivedBy", e.target.value)} />

        <label>Garment:</label>
        <input type="text" onChange={(e) => handleInputChange("stitchingLine",e.target.value)} />

        <label>Total Quantity of Pieces:</label>
        <input type="text" onChange={(option) => handleInputChange("totalQuantity", option.value)} value={formData.totalQuantity}/>

        <label>Shade/Combo:</label>
        <input type="text" onChange={(e) => handleInputChange("shadeCombo", e.target.value)} value={formData.shadeCombo}/>

        <label>Sample Type:</label>
        <Select
  options={sampleTypes}
  onChange={(option) => handleInputChange("sampleType", option.value)}
  value={sampleTypes.find(option => option.value === formData.sampleType)}
/>


        <label>Style Number:</label>
        <input type="text" onChange={(e) => handleInputChange("patternNumber", e.target.value)} />

        <label>Size:</label>
        <input type="text" onChange={(e) => handleInputChange("fabricDiscussion", e.target.value)} />
      </div>

      <div className="form-section">
        <h3>Default</h3>
        <p>Contact Name: Mr. Yagappan</p>
        <label>Season:</label>
        <input type="text" onChange={(e) => handleInputChange("season", e.target.value)} />
        <p>Category: Men</p>
        <p>Fabric Qty: 1 KG</p>
        <p>Checked By: Devraj</p>
      </div>

      <div className="form-section">
        <h3>Fabric & Trim Details</h3>
        <label>Main Body Fabric:</label>
        <input type="text" onChange={(option) => handleInputChange("mainBodyFabric", option.value)} value={formData.mainBodyFabric}/>

        <label>Collar/Cuff Fabric:</label>
        <input type="text" onChange={(option) => handleInputChange("collarCuffFabric", option.value)} value={formData.collarCuffFabric}/>


        <label>Main Label:</label>
        <input type="text" onChange={(option) => handleInputChange("mainLabel", option.value)} value={formData.mainLabel}/>


        <label>Thread Shade:</label>
        <input type="text" onChange={(option) => handleInputChange("threadShade", option.value)} value={formData.threadShade}/>


        <label>Sewing Thread Code:</label>
        <input type="text" onChange={(option) => handleInputChange("sewingThread", option.value)} value={formData.sewingThread}/>


        <label>Sewing Thread Details:</label>
        <input type="text" onChange={(option) => handleInputChange("sewingThreadDetail", option.value)} value={formData.sewingThreadDetail}/>

      </div>

      <button onClick={generatePDF}>Download PDF</button>

      <div id="indent-form" style={{ display: "none", padding: "40px", fontFamily: "Arial, sans-serif", border: "2px solid #000", borderRadius: "10px", backgroundColor: "#fff" }}>
  
  {/* Company Logo */}
  <div style={{ textAlign: "center", marginBottom: "30px" }}>
    <img src="arvind.png" alt="Company Logo" style={{ maxWidth: "100px" }} />
  </div>

  {/* Heading */}
  <h2 style={{ textAlign: "center", marginBottom: "30px", fontWeight: "bold", fontSize: "24px" }}>
    Sample Indent Form
  </h2>

  {/* Form Data */}
  <div style={{ marginBottom: "5px", lineHeight: "1" }}>
    <p><b>Received Date:</b> {formData.receivedDate}</p>
    <p><b>Received By:</b> {formData.receivedBy}</p>
    <p><b>Garment:</b> {formData.stitchingLine}</p>
    <p><b>Total Quantity of Pieces:</b> {formData.totalQuantity}</p>
    <p><b>Shade/Combo:</b> {formData.shadeCombo}</p>
    <p><b>Sample Type:</b> {formData.sampleType}</p>
    <p><b>Style Number:</b> {formData.patternNumber}</p>
    <p><b>Size:</b> {formData.fabricDiscussion}</p>
  </div>

  {/* Divider */}
  <h3 style={{ marginBottom: "20px", borderBottom: "2px solid crimson", paddingBottom: "5px", color: "crimson" }}>
    Fabric & Trim Details
  </h3>

  {/* Grid Section */}
  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", alignItems: "center", marginBottom: "20px" }}>
    <p><b>Main Body Fabric:</b> {formData.mainBodyFabric}</p>
    <div style={{ width: "120px", height: "100px", border: "2px solid #000" }}></div>

    <p><b>Main Label and other trims:</b> {formData.mainLabel}</p>
    <div style={{ width: "120px", height: "100px", border: "2px solid #000" }}></div>

    <p><b>Thread Shade:</b> {formData.threadShade}</p>
    <div style={{ width: "120px", height: "100px", border: "2px solid #000" }}></div>
  </div>

  {/* Thread Details */}
  <div style={{ marginBottom: "30px" }}>
    <p><b>Sewing Thread Code:</b> {formData.sewingThread}</p>
    <p><b>Sewing Thread Details:</b> {formData.sewingThreadDetail}</p>
  </div>

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