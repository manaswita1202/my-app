import React, { useState, useEffect, act } from "react";
import { Table, Button, Input, Select, DatePicker, Tabs } from "antd";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import "./BOM.css";
import { useOutletContext } from "react-router-dom";

const { Option } = Select;
const { TabPane } = Tabs;

const BOMPage = () =>{

  const { activityData, setActivityData, styleData, setStyleData,activeStyleIndex, setActiveStyleIndex } = useOutletContext(); // Get from Layout

  const [trimsData, setTrimsData] = useState([
   {
    key: "1",
      styleNo: "",
      trims: "",
      trimDescription: "",
      color: "",
      size: "",
      uom: "",
      quantity: 0,
      supplier: ""
   } 
  ]);  
  const [fabricData, setFabricData] = useState([
    {
      key: "1",
      styleNo: "",
      bodyType: "Shell Fabric",
      description: "",
      color: "",
      size: "",
      uom: "",
      consumption: 0,
      supplier: ""
    }]);

  const [headerData, setHeaderData] = useState({
    styleNo: "",
    buyer: "",
    garment: "",
    season: "",
    createdOn: dayjs().format("YYYY-MM-DD"),
    revisedOn: dayjs().format("YYYY-MM-DD"),
    supplierName: "",
    worksheetRecordNumber: 1,
    createdBy: "",
  });

  useEffect(() => {
    setHeaderData((prev) => ({
      ...prev,
      worksheetRecordNumber: 1,
    }));
}, [fabricData, trimsData]);

useEffect(() => {
  if (styleData && activeStyleIndex !== null && styleData[activeStyleIndex]) {
    const activeStyle = styleData[activeStyleIndex];
    console.log(activeStyle);

    // Update headerData
    setHeaderData((prevHeaderData) => ({
      ...prevHeaderData,
      styleNo: activeStyle?.styleNumber || "",
      buyer: activeStyle?.brand || "",
      garment: activeStyle?.garment || "",
      season: activeStyle?.techpackData?.season || "",
    }));

    // Update fabricData based on techpackData
    if (activeStyle?.techpackData?.bom?.fabric) {
      const updatedFabricData = activeStyle.techpackData.bom?.fabric.map((fabric, index) => ({
        key: String(index + 1),
        styleNo: fabric.code || "",
        bodyType: "Shell Fabric", // Default value
        description: fabric.description || "",
        color: fabric.color, // Default value
        size: fabric.size, // Default value
        uom: "", // Default value
        consumption: 0, // Default value
        supplier: "", // Default value
      }));

      setFabricData(updatedFabricData);
    }

    // Update trimsData based on techpackData
    if (activeStyle?.techpackData?.bom?.trims) {
      const updatedTrimsData = activeStyle.techpackData.bom?.trims.map((trim, index) => ({
        key: String(index + 1),
        styleNo: trim.code || "",
        trims: trim.trim || "",
        trimDescription: trim.descirption || "",
        color: trim.color, // Default value
        size: trim.size, // Default value
        uom: "", // Default value
        quantity: trim.quantity, // Default value
        supplier: "", // Default value
      }));
      console.log(updatedTrimsData)

      setTrimsData(updatedTrimsData);
    }
  }
}, [styleData, activeStyleIndex]);

  const handleHeaderChange = (field, value) => {
    setHeaderData({ ...headerData, [field]: value });
  };

  const handleTableChange = (key, field, value, type) => {
    if (type === "fabric") {
      const newData = fabricData.map((row) => 
        row.key === key ? { ...row, [field]: value } : row
      );
      setFabricData(newData);
    } else {
      const newData = trimsData.map((row) => 
        row.key === key ? { ...row, [field]: value } : row
      );
      setTrimsData(newData);
    }
  };  
  
  const addRow = () => {
    setFabricData([
      ...fabricData,
      {
        key: String(fabricData.length + 1),
        styleNo: "",
        bodyType: "Shell Fabric",
        description: "",
        color: "",
        size: "",
        uom: "",
        consumption: 0,
        supplier: "",
      },
    ]);
  };
  const addRowTrims = () => {
    setTrimsData([
      ...trimsData,
      {
        key: String(trimsData.length + 1),
        styleNo: "",
        trims: "",
        trimDescription: "",
        color: "",
        size: "",
        uom: "",
        quantity: 0,
        supplier: "",
      },
    ]);
  };
  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Title
    doc.setFontSize(18);
    doc.text("Bill of Materials (BOM)", 14, 15);
  
    // Header Section
    doc.setFontSize(12);
    doc.text(`Style No: ${headerData.styleNo}`, 14, 25);
    doc.text(`Buyer: ${headerData.buyer}`, 14, 32);
    doc.text(`Garment: ${headerData.garment}`, 14, 39);
    doc.text(`Season: ${headerData.season}`, 14, 46);
    doc.text(`Created On: ${headerData.createdOn}`, 14, 53);
    doc.text(`Revised On: ${headerData.revisedOn}`, 14, 60);
    doc.text(`Supplier: ${headerData.supplierName}`, 14, 67);
    doc.text(`Worksheet No: ${headerData.worksheetRecordNumber}`, 14, 74);
    doc.text(`Created By: ${headerData.createdBy}`, 14, 81);
  
    // Fabric Table
    doc.autoTable({
      startY: 90,
      head: [["S. No.", "Code", "Body Type", "Description", "Color", "Size", "UOM", "Consumption", "Supplier"]],
      body: fabricData.map((row, index) => [
        index + 1,
        row.styleNo,
        row.bodyType,
        row.description,
        row.color,
        row.size,
        row.uom,
        row.consumption,
        row.supplier,
      ]),
    });
  
    // Trims Table
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [["S. No.", "Style No.", "Trims", "Trim Description", "Color", "Size", "UOM","Quantity", "Supplier"]],
      body: trimsData.map((row, index) => [
        index + 1,
        row.styleNo,
        row.trims,
        row.trimDescription,
        row.color,
        row.size,
        row.uom,
        row.quantity,
        row.supplier,
      ]),
    });
  
    // Save the PDF
    doc.save("BOM_Report.pdf");
  };
  


  const columnsFabric = [
    { title: "S. No.", dataIndex: "key", key: "key" },
    {
      title: "Code",
      dataIndex: "styleNo",
      key: "styleNo",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "styleNo", e.target.value, "fabric")
          }
        />
      ),
    },
    {
      title: "Body Type",
      dataIndex: "bodyType",
      key: "bodyType",
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => handleTableChange(record.key, "bodyType", value, "fabric")}
          style={{ width: "100%" }}
        >
          <Option value="Shell Fabric">Shell Fabric</Option>
        </Select>
      ),
    },
    {
        title: "Description",
        dataIndex: "description",
        key: "description",
        render: (text, record) => (
          <Input
            value={text}
            onChange={(e) =>
              handleTableChange(record.key, "description", e.target.value, "fabric")
            }
          />
        ),
      },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "color", e.target.value, "fabric")
          }
        />
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => handleTableChange(record.key, "size", value, "fabric")}
          style={{ width: "100%" }}
        >
          <Option value="XS">XS</Option>
          <Option value="S">S</Option>
          <Option value="M">M</Option>
          <Option value="L">L</Option>
          <Option value="XL">XL</Option>
          <Option value="XXL">XXL</Option>
        </Select>
      ),
    },
    {
      title: "UOM",
      dataIndex: "uom",
      key: "uom",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleTableChange(record.key, "uom", e.target.value, "fabric")}
        />
      ),
    },
    {
      title: "Consumption",
      dataIndex: "consumption",
      key: "consumption",
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "consumption", Number(e.target.value), "fabric")
          }
        />
      ),
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "supplier", e.target.value, "fabric")
          }
        />
      ),
    },
  ];
  const columnsTrim = [
    { title: "S. No.", dataIndex: "key", key: "key" },
    {
      title: "Style No.",
      dataIndex: "styleNo",
      key: "StyleNo",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "StyleNo", e.target.value, "trim")
          }
        />
      ),
    },
    {
      title: "Trims",
      dataIndex: "trims",
      key: "trims",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "trims", e.target.value, "trim")
          }
        />
      ),
    },
    {
      title: "Trim Description",
      dataIndex: "trimDescription",
      key: "trimDescription",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "trimDescription", e.target.value, "trim")
          }
        />        
      ),
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "color", e.target.value, "trim")
          }
        />
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (text, record) => (
        <Select
          value={text}
          onChange={(value) => handleTableChange(record.key, "size", value, "trim")}
          style={{ width: "100%" }}
        >
          <Option value="XS">XS</Option>
          <Option value="S">S</Option>
          <Option value="M">M</Option>
          <Option value="L">L</Option>
          <Option value="XL">XL</Option>
          <Option value="XXL">XXL</Option>
        </Select>
      ),
    },
    {
      title: "UOM",
      dataIndex: "uom",
      key: "uom",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleTableChange(record.key, "uom", e.target.value, "trim")}
        />
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "quantity", Number(e.target.value), "trim")
          }
        />
      ),
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleTableChange(record.key, "supplier", e.target.value, "trim")
          }
        />
      ),
    },
  ];

  return (
    <div className="bom-container">
      <h2 className="bom-title">Bill of Materials (BOM)</h2>

      <div className="bom-header">
      <div className="header-row">
      <Input
            className="header-input"
            placeholder="Style No."
            value={headerData.styleNo}
            onChange={(e) => handleHeaderChange("styleNo", e.target.value)}
          />
          <Input
            className="header-input"
            placeholder="Buyer"
            value={headerData.buyer}
            onChange={(e) => handleHeaderChange("buyer", e.target.value)}
          />
          <Input
            className="header-input"
            placeholder="Garment"
            value={headerData.garment}
            onChange={(e) => handleHeaderChange("garment", e.target.value)}
          />
          <Input
            className="header-input"
            placeholder="Season"
            value={headerData.season}
            onChange={(e) => handleHeaderChange("season", e.target.value)}
          />
        </div>
        <div className="header-row">
          <DatePicker
            className="header-input"
            value={dayjs(headerData.createdOn)}
            disabled
          />
          <DatePicker
            className="header-input"
            value={dayjs(headerData.revisedOn)}
            disabled
          />
          <Input
            className="header-input"
            placeholder="Supplier Name"
            value={headerData.supplierName}
            onChange={(e) => handleHeaderChange("supplierName", e.target.value)}
          />
          <Input
            className="header-input"
            placeholder="Created By"
            value={headerData.createdBy}
            onChange={(e) => handleHeaderChange("createdBy", e.target.value)}
          />
        </div>
        <div className="header-row">
          <Input
            className="header-input"
            placeholder="Worksheet Record Number"
            value={headerData.worksheetRecordNumber}
            disabled
          />
        </div>
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Fabric" key="1">
          <Table columns={columnsFabric} dataSource={fabricData} pagination={false} />
          <Button className="add-rowtrim-btn" onClick={addRow}>+ Add Row</Button>
        </TabPane>
        <TabPane tab="Trims" key="2">
          <Table columns={columnsTrim} dataSource={trimsData} pagination={false} />
          <Button className="add-rowtrim-btn" onClick={addRowTrims}>+ Add Row</Button>
        </TabPane>
      </Tabs>
      <Button className="save-pdf-btn" onClick={generatePDF} >Save as PDF</Button>
    </div>
  );
};

export default BOMPage;