import React, { useState } from "react";
import "./Vendor.css";
import arvindLogo from "./assets/arvind.png";
import averylogo from "./assets/averylogo.jpg";
import gmsLogo from "./assets/gms.png";
import sriAmmanLogo from "./assets/sat.png";
import manoharLogo from "./assets/mfilaments.png";
import nkPackLogo from "./assets/nkp.png";

const VendorPage = () => {
  const [fabricVendors, setFabricVendors] = useState([
    { logo: arvindLogo, name: "Arvind Mills", location: "Akskere", vendorNumber: "456576", contactPerson: "Ajeet Kumar", phone: "9876543210", email: "ajeetk@arvindmills.in" },
    { logo: arvindLogo, name: "Arvind Mills", location: "Indore", vendorNumber: "456577", contactPerson: "Bhaskara J", phone: "8100019632", email: "bhaskaraj@arvindmills.in" },
    { logo: gmsLogo, name: "GMS Processors Pvt Ltd", location: "Tirupur", vendorNumber: "67890", contactPerson: "Karthike CS", phone: "8986922189", email: "karthikecs@gmp.com" }
  ]);

  const [trimVendors, setTrimVendors] = useState([
    { logo: sriAmmanLogo, name: "Sri Amman Tapes", location: "Tirupur", vendorNumber: "11223", contactPerson: "Mike Johnson", phone: "9876543212", email: "mike@sriamman.com" },
    { logo: manoharLogo, name: "Manohar Filaments", location: "Bengaluru", vendorNumber: "44556", contactPerson: "Ritu Dingra", phone: "9900032280", email: "ritudingra@manoharfilaments.com" },
    { logo: nkPackLogo, name: "NK Pack", location: "Mumbai", vendorNumber: "77889", contactPerson: "Liam Wilson", phone: "9876543214", email: "liam@nkpack.com" },
    { logo: averylogo, name: "Avery Dennison", location: "Bengaluru", vendorNumber: "89877", contactPerson: "Rishi Kapoor Sachin", phone: "9958587368", email: "rishikapoor@averydennsion.com" }
  ]);

  const addMoreVendor = (type) => {
    const name = prompt("Enter Vendor Name:");
    const location = prompt("Enter Location:");
    const vendorNumber = prompt("Enter Vendor Number:");
    const contactPerson = prompt("Enter Contact Person:");
    const phone = prompt("Enter Phone Number:");
    const email = prompt("Enter Email ID:");

    if (name && location && vendorNumber && contactPerson && phone && email) {
      const newVendor = { logo: "", name, location, vendorNumber, contactPerson, phone, email };
      if (type === "fabric") {
        setFabricVendors([...fabricVendors, newVendor]);
      } else {
        setTrimVendors([...trimVendors, newVendor]);
      }
    }
  };

  // Function to create mailto link with subject and body
  const createMailtoLink = (email, subject, body) => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  // Email templates for each button
  const labDipEmailTemplate = (vendorName) => ({
    subject: `Lab Dip Request - ${vendorName}`,
    body: `Dear ${vendorName},

I would like to request sample swatches for the following items:

[INSERT ITEM DETAILS]

Please provide an estimated timeline for the lab dip samples.

Thank you,
[YOUR NAME]`
  });

  const bulkFabricEmailTemplate = (vendorName) => ({
    subject: `Bulk Fabric Order - ${vendorName}`,
    body: `Dear ${vendorName},

I would like to place an order for bulk fabric with the following specifications:

[INSERT FABRIC DETAILS]
[INSERT QUANTITY]
[INSERT DELIVERY REQUIREMENTS]

Please provide a quote and estimated delivery timeline.

Thank you,
[YOUR NAME]`
  });

  // Vendor card component with email buttons
  const VendorCard = ({ vendor, index }) => {
    const labDipEmail = labDipEmailTemplate(vendor.name);
    const bulkFabricEmail = bulkFabricEmailTemplate(vendor.name);

    return (
      <div key={index} className="vendor-card">
        <div className="vendor-info">
          <img src={vendor.logo} alt={vendor.name} className="vendor-logo" />
          <div>
            <h4>{vendor.name}</h4>
            <p>{vendor.location}</p>
            <p>Vendor Number: {vendor.vendorNumber}</p>
          </div>
        </div>
        <div className="vendor-contact">
          <p><strong>Contact Person:</strong> {vendor.contactPerson}</p>
          <p><strong>Phone:</strong> {vendor.phone}</p>
          <p><strong>Email:</strong> {vendor.email}</p>
          <div className="vendor-buttons">
            <a 
              href={createMailtoLink(vendor.email, labDipEmail.subject, labDipEmail.body)}
              className="vendor-email-btn lab-dip-btn"
            >
              Lab Dip
            </a>
            <a 
              href={createMailtoLink(vendor.email, bulkFabricEmail.subject, bulkFabricEmail.body)}
              className="vendor-email-btn bulk-fabric-btn"
            >
              Bulk Fabric
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vendor-page">
      <h2>Vendors</h2>

      {/* Fabric Vendors */}
      <div className="vendor-section">
        <h3>Fabrics</h3>
        <div className="vendor-list">
          {fabricVendors.map((vendor, index) => (
            <VendorCard vendor={vendor} index={index} key={index} />
          ))}
        </div>
        <button className="add-more-btn" onClick={() => addMoreVendor("fabric")}>+ Add More</button>
      </div>

      {/* Trim Vendors */}
      <div className="vendor-section">
        <h3>Trims</h3>
        <div className="vendor-list">
          {trimVendors.map((vendor, index) => (
            <VendorCard vendor={vendor} index={index} key={index} />
          ))}
        </div>
        <button className="add-more-btn" onClick={() => addMoreVendor("trim")}>+ Add More</button>
      </div>
    </div>
  );
};

export default VendorPage;