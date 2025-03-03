  import React, { useState, useRef } from "react";
  import jsPDF from "jspdf";
  import html2canvas from "html2canvas";
  import "./CostSheet.css";
  import { useOutletContext } from "react-router-dom";
  import { useEffect } from "react";

  const CostSheetHeader = () => {

    const { activityData, setActivityData, styleData, setStyleData,activeStyleIndex, setActiveStyleIndex } = useOutletContext(); // Get from Layout
    const [fabricRows, setFabricRows] = useState([
      { fabricType: "", source: "Local", description: "", rate: "", consumption: "", fabricCost: 0, inwardTransport: "", gst: "5%", fabricLandedCost: 0 }
    ]);

    const [trimRows, setTrimRows] = useState([{ trim: "", source: "Local", description: "", rate: "", quantityPerGmt: "", inwardDuty: 0, gst: "5%", trimCost: 0 }]);

    const [valueAddRows, setValueAddRows] = useState([
      { valueAdd: "Waistband", process: "Printing", cost: "" },
      { valueAdd: "Pocket", process: "Embroidery", cost: "" },
      { valueAdd: "GPT", process: "Testing", cost: "" },
      { valueAdd: "Support", process: "Development & Sampling", cost: "" },
      { valueAdd: "Wash-Softner", process: "", cost: "" },
      { valueAdd: "Wash", process: "", cost: "" }
    ]);

    const [processLossData, setProcessLossData] = useState([
      { description: "CUT to PACK", loss: 1.5, checked: true },
      { description: "BASIC EMB - WOVEN", loss: 0.5, checked: false },
      { description: "BASIC EMB - KNITS (< 10000 STITCHES)", loss: 1.0, checked: false },
      { description: "MEDIUM TO HEAVY EMBROIDERY (> 10000 STITCHES)", loss: 1.0, checked: false },
      { description: "BASIC WASH / SOFTNER WASH", loss: 0.5, checked: true },
      { description: "ENZYME WASH", loss: 1.0, checked: false },
      { description: "DENIM WASH", loss: 2.0, checked: false },
      { description: "GARMENT DYE", loss: 3.0, checked: false },
      { description: "ACID WASH", loss: 3.0, checked: false },
      { description: "BASIC PRINT", loss: 0.5, checked: false },
      { description: "SPECIAL PRINT / FOIL / FLOCK", loss: 1.0, checked: false }
    ]);

    const [formData, setFormData] = useState({
      merchantName: "",
      segment: "Men",
      buyer: "",
      product: "",
      style: "",
      shipTolerance: "",
      creditDays: "",
      paymentTerms: "Open Credit",
      extrapolation: 0,
      complexity: "Low",
      season: "",
      smvPerPc: "",
      fobPerPiece: "",
      fobCurrency: "INR",
      exchangeRate: 1,
      inrNetFob: "",
      piecesPerPack: "",
      efficiency: "",
      fabricComposition: "",
      orderQuantity: "",
      actualExpBenefits: 0.0,
      maxExpBenefits: 6.16,
      agentCommission: "",
      buyerDiscount: "",
      financeCost: 0.0,
      styleQuantity: ""
    });
    useEffect(() => {
      
      if (styleData && activeStyleIndex !== null && styleData[activeStyleIndex]) {
        const activeStyle = styleData[activeStyleIndex];
        console.log(activeStyle)
        setFormData(prevFormData => ({
          ...prevFormData,
          buyer: activeStyle?.brand || "",
          product: activeStyle?.garment || "",
          style: activeStyle?.styleNumber || "",
          smvPerPc: activeStyle?.smv || 0,
          season: activeStyle?.techpackData?.season,
          orderQuantity : activeStyle?.quantity
        }));

        console.log("ko")
        if (activeStyle?.techpackData?.costSheet?.fabricCost) {
          const updatedFabricRows = activeStyle?.techpackData?.costSheet?.fabricCost.map((fabric) => ({
            fabricType: fabric.fabricType || "",
            source: "Local", // Default value
            description: fabric.description || "",
            rate: "", // Default value
            consumption: "", // Default value
            fabricCost: 0, // Default value
            inwardTransport: "", // Default value
            gst: "5%", // Default value
            fabricLandedCost: 0, // Default value
          }));
          console.log(updatedFabricRows)
    
          setFabricRows(updatedFabricRows);
        }
        console.log("trim")
        if (activeStyle?.techpackData?.costSheet?.trimCost) {
          const updatedTrimRows = activeStyle?.techpackData?.costSheet?.trimCost.map((trims) => ({
            trim: trims.trim || "", // Use the trim name from techpackData
            source: "Local", // Default value
            description: trims.descirption || "", // Use the description from techpackData
            rate: "", // Default value
            quantityPerGmt: trims.quantity, // Default value
            inwardDuty: 0, // Default value
            gst: "5%", // Default value
            trimCost: 0, // Default value
          }));
          console.log(updatedTrimRows)
    
          setTrimRows(updatedTrimRows);
        }
  

  
      }

    }, [styleData, activeStyleIndex]);
    

    const [outwardTransportation, setOutwardTransportation] = useState(["", ""]);
    const [otherCharges, setOtherCharges] = useState(["", ""]);

    const handleCheckboxChange = (index) => {
      setProcessLossData((prev) =>
        prev.map((row, i) => (i === index ? { ...row, checked: !row.checked } : row))
      );
    };

    const exchangeRates = { INR: 1, USD: 82, GBP: 102, EUR: 90 };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (name === "fobCurrency") {
        setFormData((prev) => ({ ...prev, exchangeRate: exchangeRates[value] }));
      }
      if (name === "creditDays") {
        const financeCost = (11 * value) / 365;
        setFormData((prev) => ({ ...prev, financeCost: financeCost.toFixed(2) }));
      }
      if (name === "shipTolerance") {
        const extrapolation = parseFloat(value) || 0;
        setFormData((prev) => ({ ...prev, extrapolation }));
      }
      if (name === "fobPerPiece") {
        const inrNetFob = value * formData.exchangeRate * (1 - (formData.agentCommission / 100 || 0) - (formData.buyerDiscount / 100 || 0) - (formData.financeCost / 100 || 0));
        setFormData((prev) => ({ ...prev, inrNetFob: inrNetFob.toFixed(2) }));
      }
    };

    const handleFabricChange = (index, e) => {
      const { name, value } = e.target;
      setFabricRows((prev) => {
        const updatedRows = [...prev];
        updatedRows[index] = { ...updatedRows[index], [name]: value };
        if (name === "rate" || name === "consumption") {
          updatedRows[index].fabricCost = (updatedRows[index].rate || 0) * (updatedRows[index].consumption || 0);
        }
        if (name === "inwardTransport") {
          updatedRows[index].fabricLandedCost = updatedRows[index].fabricCost + (updatedRows[index].consumption || 0) * (value || 0);
        }
        return updatedRows;
      });
    };

    const addFabricRow = () => {
      setFabricRows([...fabricRows, { fabricType: "", source: "Local", description: "", rate: "", consumption: "", fabricCost: 0, inwardTransport: "", gst: "5%", fabricLandedCost: 0 }]);
    };

    // Calculate total values
    const totalFabricLandedCost = fabricRows.reduce((sum, row) => sum + (parseFloat(row.fabricLandedCost) || 0), 0);
    const totalFabricCostPercentToFOB = formData.inrNetFob ? ((totalFabricLandedCost / formData.inrNetFob) * 100).toFixed(2) : 0;
    const totalFabricLandedCostPerGmt = fabricRows.reduce((sum, row) => sum + ((parseFloat(row.fabricCost) || 0) * (parseFloat(row.gst) / 100 || 0)), 0);

    const handleTrimChange = (index, e) => {
      const { name, value } = e.target;
      setTrimRows((prev) => {
        const updatedRows = [...prev];
        updatedRows[index] = { ...updatedRows[index], [name]: value };

        if (name === "rate" || name === "quantityPerGmt") {
          updatedRows[index].inwardDuty = (updatedRows[index].rate || 0) * 0.35;
          updatedRows[index].trimCost = (updatedRows[index].rate || 0) * (updatedRows[index].quantityPerGmt || 0) + updatedRows[index].inwardDuty;
        }
        return updatedRows;
      });
    };

    const addTrimRow = () => {
      setTrimRows([...trimRows, { trim: "", source: "Local", description: "", rate: "", quantityPerGmt: "", inwardDuty: 0, gst: "5%", trimCost: 0 }]);
    };

    // Total Calculations
    const totalTrimsCost = trimRows.reduce((sum, row) => sum + ((parseFloat(row.gst) / 100) * (row.rate || 0) * (row.quantityPerGmt || 0)), 0);
    const sumInwardFreightDuty = trimRows.reduce((sum, row) => sum + (row.inwardDuty || 0), 0);
    const trimsCostWithoutDuty = totalTrimsCost - sumInwardFreightDuty;
    const totalTrimsCostPercentToFOB = formData.inrNetFob ? ((totalTrimsCost / formData.inrNetFob) * 100).toFixed(2) : 0;

    const handleValueAddChange = (index, e) => {
      const { value } = e.target;
      setValueAddRows((prev) => {
        const updatedRows = [...prev];
        updatedRows[index].cost = value;
        return updatedRows;
      });
    };

    const addValueAddRow = () => {
      setValueAddRows([...valueAddRows, { valueAdd: "", process: "", cost: "" }]);
    };

    // Calculate Total Process Loss % (sum of checked rows)
    const totalProcessLoss = processLossData
      .filter((row) => row.checked)
      .reduce((sum, row) => sum + row.loss, 0);

    // Auto-filled values for Value Loss / Rejection
    const valueLossRejection = totalProcessLoss;
    const valueLossRejectionInr = ((valueLossRejection / 100) * formData.inrNetFob).toFixed(2);

    // Auto-fill Other Charges row 2
    const otherChargesInr = ((otherCharges[0] / 100) * formData.inrNetFob).toFixed(2) || 0;

    // Total Calculations
    const totalValueAddCost = valueAddRows.reduce((sum, row) => sum + (parseFloat(row.cost) || 0), 0);
    const totalValueAddCostPercentToFOB = formData.inrNetFob
      ? ((totalValueAddCost / formData.inrNetFob) * 100).toFixed(2)
      : "0.00%";

      // Sum of all second rows of Value Loss & Other Costs
    const totalSecondRowSum =
    parseFloat(valueLossRejectionInr) +
    parseFloat(outwardTransportation[1] || 0) +
    parseFloat(otherChargesInr || 0);

  // Calculate Total Variable Costs
  const totalVariableCostsCalc =
    totalFabricLandedCost + totalTrimsCost + totalValueAddCost  + totalSecondRowSum;

  // Calculate Gross Contribution per Gmt
  const grossContributionPerGmt = formData.inrNetFob - totalVariableCostsCalc;

  // Calculate Total Variable Cost % to FOB
  const totalVariableCostPercent = ((totalVariableCostsCalc / formData.inrNetFob) * 100).toFixed(2);

  // Calculate Contribution % to FOB
  const contributionPercent = ((grossContributionPerGmt / formData.inrNetFob) * 100).toFixed(2);

  // Corporate OHs
  const corporateOhs = (formData.inrNetFob * 0.1).toFixed(2);

  // Cost of Manufacturing (CM)
  const costOfManufacturing = 
    ((formData.smvPerPc * 5) / (formData.efficiency / 100) - corporateOhs).toFixed(2);

    // EBITDA per PC
    const ebitdaPerPc = (grossContributionPerGmt - corporateOhs - costOfManufacturing).toFixed(2);

    // EBITDA % to FOB
    const ebitdaPercentToFob = ((ebitdaPerPc / formData.inrNetFob) * 100).toFixed(2);

    // Cost Per Min
    const costPerMin = ((parseFloat(corporateOhs) + parseFloat(costOfManufacturing)) / formData.smvPerPc).toFixed(2);

    // GC per Standard Minute
    const gcPerStandardMin = (grossContributionPerGmt / formData.smvPerPc).toFixed(2);

    const pdfRef = useRef();

    const exportPDF = () => {
      const input = pdfRef.current;
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("CostSheet.pdf");
      });
    };

    return (
      <div ref={pdfRef} className="cost-sheet-container">
        <h2 className="text-xl font-bold mb-4">Cost Sheet</h2>
        <div className="form-grid"> 
          {Object.keys(formData).map((key) => (
            <div key={key} className="form-group">
              <label className="block font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim()}:</label>
              {typeof formData[key] === "number" || key === "product" ||key==="inrNetFob" || key === "smvPerPiece"|| key === "merchantName" || key === "style" || key === "shipTolerance" || key === "creditDays" || key === "fobPerPiece" || key === "piecesPerPack" || key === "efficiency" || key === "fabricComposition" || key === "orderQuantity" || key === "actualExpBenefits" || key === "maxExpBenefits" || key === "agentCommission" || key === "buyerDiscount" || key === "financeCost" || key === "styleQuantity" || key === "buyer" ? (
                <input type="text" name={key} value={formData[key]} onChange={handleChange} className="border p-2 w-full" />
              ) : (
                <select name={key} value={formData[key]} onChange={handleChange} className="border p-2 w-full">
                  {key === "segment" && ["Men", "Women", "Kids"].map((option) => <option key={option}>{option}</option>)}
                  {key === "buyer" && ["Hugo Boss", "Arrow", "Us Polo"].map((option) => <option key={option}>{option}</option>)}
                  {key === "product" && ["Shirt", "T-shirt", "Shorts", "Trousers"].map((option) => <option key={option}>{option}</option>)}
                  {key === "paymentTerms" && ["Open Credit", "DA", "LC", "Advance"].map((option) => <option key={option}>{option}</option>)}
                  {key === "complexity" && ["Low", "Medium", "High"].map((option) => <option key={option}>{option}</option>)}
                  {key === "fobCurrency" && ["INR", "USD", "GBP", "EUR"].map((option) => <option key={option}>{option}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
        <h3 className="text-lg font-bold mt-6">Fabric Cost Table</h3>
        <table className="w-full border mt-4">
          <thead>
            <tr>
              <th>Fabric Type</th><th>Source</th><th>Description</th><th>Rate</th><th>Consumption</th><th>Fabric Cost</th><th>Inward Transport</th><th>GST</th><th>Fabric Landed Cost</th>
            </tr>
          </thead>
          <tbody>
            {fabricRows.map((row, index) => (
              <tr key={index}>
                <td><input type="text" name="fabricType" value={row.fabricType} onChange={(e) => handleFabricChange(index, e)} /></td>
                <td>
                  <select name="source" value={row.source} onChange={(e) => handleFabricChange(index, e)}>
                    <option>Local</option>
                    <option>Import</option>
                  </select>
                </td>
                <td><input type="text" name="description" value={row.description} onChange={(e) => handleFabricChange(index, e)} /></td>
                <td><input type="number" name="rate" value={row.rate} onChange={(e) => handleFabricChange(index, e)} /></td>
                <td><input type="number" name="consumption" value={row.consumption} onChange={(e) => handleFabricChange(index, e)} /></td>
                <td>{row.fabricCost.toFixed(2)}</td>
                <td><input type="number" name="inwardTransport" value={row.inwardTransport} onChange={(e) => handleFabricChange(index, e)} /></td>
                <td>
                  <select name="gst" value={row.gst} onChange={(e) => handleFabricChange(index, e)}>
                    <option>5%</option><option>12%</option><option>18%</option><option>28%</option><option>0%</option>
                  </select>
                </td>
                <td>{row.fabricLandedCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="8"><strong>Total Fabric Landed Cost</strong></td>
              <td>{totalFabricLandedCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="8"><strong>Total Fabric Cost % to FOB</strong></td>
              <td>{totalFabricCostPercentToFOB}%</td>
            </tr>
            <tr>
              <td colSpan="8"><strong>Total Fabric Landed Cost per Gmt</strong></td>
              <td>{totalFabricLandedCostPerGmt.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <button onClick={addFabricRow} className="mt-2 p-2 bg-blue-500 text-white">+ Add Row</button>
      {/* Trim Cost Table */}
      <h3 className="text-lg font-bold mt-6">Trim Cost Table</h3>
        <table className="w-full border mt-4">
          <thead>
            <tr>
              <th>Trims</th><th>Source</th><th>Description</th><th>Rate</th><th>Quantity/Gmt</th><th>Inward Freight & Duty</th><th>GST</th><th>Trim Cost</th>
            </tr>
          </thead>
          <tbody>
            {trimRows.map((row, index) => (
              <tr key={index}>
                <td><input type="text" name="trim" value={row.trim} onChange={(e) => handleTrimChange(index, e)} /></td>
                <td>
                  <select name="source" value={row.source} onChange={(e) => handleTrimChange(index, e)}>
                    <option>Local</option>
                    <option>Import</option>
                  </select>
                </td>
                <td><input type="text" name="description" value={row.description} onChange={(e) => handleTrimChange(index, e)} /></td>
                <td><input type="number" name="rate" value={row.rate} onChange={(e) => handleTrimChange(index, e)} /></td>
                <td><input type="number" name="quantityPerGmt" value={row.quantityPerGmt} onChange={(e) => handleTrimChange(index, e)} /></td>
                <td>{row.inwardDuty.toFixed(2)}</td>
                <td>
                  <select name="gst" value={row.gst} onChange={(e) => handleTrimChange(index, e)}>
                    <option>5%</option><option>12%</option><option>18%</option><option>28%</option><option>0%</option>
                  </select>
                </td>
                <td>{row.trimCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6"><strong>Total Trims Cost</strong></td>
              <td colSpan="2">{totalTrimsCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="6"><strong>Sum Inward Freight & Duty</strong></td>
              <td colSpan="2">{sumInwardFreightDuty.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="6"><strong>Trims Cost Without Duty</strong></td>
              <td colSpan="2">{trimsCostWithoutDuty.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="6"><strong>Total Trims Cost % to FOB</strong></td>
              <td colSpan="2">{totalTrimsCostPercentToFOB}%</td>
            </tr>
          </tfoot>
        </table>

        <button onClick={addTrimRow} className="mt-2 p-2 bg-blue-500 text-white">+ Add Row</button>
        {/* Value Add & Process Table */}
        <h3 className="text-lg font-bold mt-6">Value Add & Process Table</h3>
        <table className="w-full border mt-4">
          <thead>
            <tr>
              <th>Value Add</th>
              <th>Process Details</th>
              <th>Value Add Cost/Gmt</th>
            </tr>
          </thead>
          <tbody>
            {valueAddRows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={row.valueAdd}
                    onChange={(e) => {
                      const updatedRows = [...valueAddRows];
                      updatedRows[index].valueAdd = e.target.value;
                      setValueAddRows(updatedRows);
                    }}
                    disabled={row.process !== ""}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.process}
                    onChange={(e) => {
                      const updatedRows = [...valueAddRows];
                      updatedRows[index].process = e.target.value;
                      setValueAddRows(updatedRows);
                    }}
                    disabled={row.valueAdd !== ""}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.cost}
                    onChange={(e) => handleValueAddChange(index, e)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addValueAddRow} className="mt-2 p-2 bg-blue-500 text-white">
          + Add Row
        </button>

        {/* Summary Rows */}
        <table className="w-full border mt-4">
          <tbody>
            <tr>
              <td><strong>Total Value Add Cost/Gmt</strong></td>
              <td>{totalValueAddCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total Value Add Cost % to FOB</strong></td>
              <td>{totalValueAddCostPercentToFOB}</td>
            </tr>
          </tbody>
        </table>
        {/* Process Loss Table */}
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2 border">Check Box</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Process Loss %</th>
            </tr>
          </thead>
          <tbody>
            {processLossData.map((row, index) => (
              <tr key={index} className="text-center">
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={row.checked}
                    onChange={() => handleCheckboxChange(index)}
                  />
                </td>
                <td className="p-2 border">{row.description}</td>
                <td className="p-2 border">{row.loss}%</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td colSpan="2" className="p-2 border text-right">Total Process Loss %</td>
              <td className="p-2 border">{totalProcessLoss.toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>

        {/* Value Loss Table */}
        <h3 className="text-lg font-bold mt-6">Value Loss & Other Costs</h3>
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-2 border">Value Loss / Rejection (%)</th>
              <th className="p-2 border">Outward Transportation</th>
              <th className="p-2 border">Other Charges</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">{valueLossRejection.toFixed(2)}%</td>
              <td className="p-2 border">
                <input
                  type="number"
                  value={outwardTransportation[0]}
                  onChange={(e) => setOutwardTransportation([e.target.value, outwardTransportation[1]])}
                  className="w-full p-2 border rounded"
                />
              </td>
              <td className="p-2 border">
                <input
                  type="number"
                  value={otherCharges[0]}
                  onChange={(e) => setOtherCharges([e.target.value, otherCharges[1]])}
                  className="w-full p-2 border rounded"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2 border">{valueLossRejectionInr} INR</td>
              <td className="p-2 border">
                <input
                  type="number"
                  value={outwardTransportation[1]}
                  onChange={(e) => setOutwardTransportation([outwardTransportation[0], e.target.value])}
                  className="w-full p-2 border rounded"
                />
              </td>
              <td className="p-2 border">{otherChargesInr} INR</td>
            </tr>
          </tbody>
        </table>
        {/* Summary Table */}
        <h3 className="text-lg font-bold mt-6">Summary</h3>
        <table className="w-full border mt-4">
          <tbody>
            <tr><td className="p-2 border">Total Variable Costs</td><td className="p-2 border">{totalVariableCostsCalc} INR</td></tr>
            <tr><td className="p-2 border">Gross Contribution per Gmt</td><td className="p-2 border">{grossContributionPerGmt} INR</td></tr>
            <tr><td className="p-2 border">Total Variable Cost % to FOB</td><td className="p-2 border">{totalVariableCostPercent}%</td></tr>
            <tr><td className="p-2 border">Contribution % to FOB</td><td className="p-2 border">{contributionPercent}%</td></tr>
            <tr><td className="p-2 border">Corporate OHs</td><td className="p-2 border">{corporateOhs} INR</td></tr>
            <tr><td className="p-2 border">Cost of Manufacturing</td><td className="p-2 border">{costOfManufacturing} INR</td></tr>
            <tr><td className="p-2 border">EBITDA per PC</td><td className="p-2 border">{ebitdaPerPc} INR</td></tr>
            <tr><td className="p-2 border">EBITDA % to FOB</td><td className="p-2 border">{ebitdaPercentToFob}%</td></tr>
            <tr><td className="p-2 border">Cost Per Min</td><td className="p-2 border">{costPerMin} INR</td></tr>
            <tr><td className="p-2 border">GC per Standard Minute</td><td className="p-2 border">{gcPerStandardMin} INR</td></tr>
          </tbody>
        </table>
        <button onClick={exportPDF} className="export-pdf-btn">Export as PDF</button>
      </div>
    );
  };

  export default CostSheetHeader;
