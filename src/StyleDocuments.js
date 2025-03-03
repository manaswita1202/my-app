import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewFiles = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/get_uploaded_files")
      .then(response => setFiles(response.data))
      .catch(error => console.error("Error fetching files:", error));
  }, []);

  return (
    <div>
      <h2>Uploaded Files</h2>
      <table border="1" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>Buyer Name</th>
            <th>Garment</th>
            <th>File Type</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr key={index}>
              <td>{file.buyerName}</td>
              <td>{file.garment}</td>
              <td>{file.fileType}</td>
              <td><a href={file.filePath} target="_blank" rel="noopener noreferrer">View</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewFiles;
