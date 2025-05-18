import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BuyerPage = () => {
  const currentPath = window.location.pathname;
  console.log(decodeURI(currentPath.split("/")[3]))
  const buyerName = decodeURI(currentPath.split("/")[3]); // Get buyer name from URL slug
  const garments = ["T-Shirts", "Shirts", "Shorts", "Trousers"];
  const [files, setFiles] = useState({});

  const handleFileChange = (garment, fileType, event) => {
    const newFiles = { ...files };
    if (!newFiles[garment]) {
      newFiles[garment] = {};
    }
    newFiles[garment][fileType] = event.target.files[0];
    setFiles(newFiles);
  };
  const triggerNotification = async (message) => {
    try {
      await fetch("https://samplify-backend-production.up.railway.app/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      console.error("Error triggering notification:", error);
    }
  };


  const handleUpload = async (garment) => {
    const formData = new FormData();
    formData.append("buyerName", buyerName);
    formData.append("garment", garment);

    if (files[garment]?.techpack) {
      formData.append("techpack", files[garment].techpack);
    }
    if (files[garment]?.bom) {
      formData.append("bom", files[garment].bom);
    }
    if (files[garment]?.specSheet) {
      formData.append("specSheet", files[garment].specSheet);
    }

    try {
      const response = await axios.post("https://samplify-backend-production.up.railway.app/upload_files_new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      triggerNotification("New style has been added - After order creation page")
      alert(response.data.message);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("File upload failed!");
    }
  };

  return (
    <div>
      <h2>Upload Files for {buyerName}</h2>
      {garments.map((garment) => (
        <div key={garment} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
          <h3>{garment}</h3>
          <label>Techpack: <input type="file" onChange={(e) => handleFileChange(garment, "techpack", e)} /></label>
          <br />
          <label>BOM: <input type="file" onChange={(e) => handleFileChange(garment, "bom", e)} /></label>
          <br />
          <label>Spec-sheet: <input type="file" onChange={(e) => handleFileChange(garment, "specSheet", e)} /></label>
          <br />
          <button onClick={() => handleUpload(garment)}>Upload</button>
        </div>
      ))}
    </div>
  );
};

export default BuyerPage;
