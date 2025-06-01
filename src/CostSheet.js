import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import 'jspdf-autotable'; // Import jspdf-autotable
import "./CostSheet.css";
import { useOutletContext } from "react-router-dom";

const CostSheetHeader = () => {
  const { activityData, setActivityData, styleData, setStyleData, activeStyleIndex, setActiveStyleIndex } = useOutletContext(); // Get from Layout
  const [fabricRows, setFabricRows] = useState([
    { fabricType: "", source: "Local", description: "", rate: "", consumption: "", fabricCost: 0, inwardTransport: "", gst: "0%", fabricLandedCost: 0 } // GST default to 5% to match options
  ]);

  const [trimRows, setTrimRows] = useState([{ trim: "", source: "Local", description: "", rate: "", quantityPerGmt: "", inwardDuty: 0, gst: "0%", trimCost: 0 }]); // GST default to 5%

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
  const totalProcessLoss = processLossData
  .filter((row) => row.checked)
  .reduce((sum, row) => sum + (parseFloat(row.loss) || 0), 0);


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
      setFormData(prevFormData => ({
        ...prevFormData,
        buyer: activeStyle?.brand || "",
        product: activeStyle?.garment || "",
        style: activeStyle?.styleNumber || "",
        smvPerPc: activeStyle?.smv || 0,
        season: activeStyle?.techpackData?.season || "",
        orderQuantity: activeStyle?.quantity || ""
      }));

      if (activeStyle?.techpackData?.costSheet?.fabricCost) {
        const updatedFabricRows = activeStyle.techpackData.costSheet.fabricCost.map((fabric) => ({
          fabricType: fabric.fabricType || "",
          source: fabric.source || "Local",
          description: fabric.description || "",
          rate: fabric.rate !== null ? String(fabric.rate) : "",
          consumption: fabric.quantity !== null ? String(fabric.quantity) : "",
          fabricCost: (parseFloat(fabric.rate) || 0) * (parseFloat(fabric.quantity) || 0),
          inwardTransport: fabric.inwardTransport || "",
          gst: fabric.gst || "0%",
          fabricLandedCost: ((parseFloat(fabric.rate) || 0) * (parseFloat(fabric.quantity) || 0)) + ((parseFloat(fabric.quantity) || 0) * (parseFloat(fabric.inwardTransport) || 0)), // Assuming inward transport is per unit of consumption
        }));
        setFabricRows(updatedFabricRows.length > 0 ? updatedFabricRows : [{ fabricType: "", source: "Local", description: "", rate: "", consumption: "", fabricCost: 0, inwardTransport: "", gst: "0%", fabricLandedCost: 0 }]);
      } else {
         setFabricRows([{ fabricType: "", source: "Local", description: "", rate: "", consumption: "", fabricCost: 0, inwardTransport: "", gst: "0%", fabricLandedCost: 0 }]);
      }

      if (activeStyle?.techpackData?.costSheet?.trimCost) {
        const updatedTrimRows = activeStyle.techpackData.costSheet.trimCost.map((apiTrim) => {
          const numericRate = apiTrim.rate !== null ? parseFloat(apiTrim.rate) : 0;
          const numericQuantity = apiTrim.quantity !== null ? parseFloat(apiTrim.quantity) : 0;
          const source = apiTrim.source || "Local";
          const calculatedInwardDuty = source === 'Import' ? numericRate * 0.25 : 0.00;
          const calculatedTrimCost = (numericRate * numericQuantity) + calculatedInwardDuty;

          return {
            trim: apiTrim.trim || "",
            source: source,
            description: apiTrim.description || "",
            rate: apiTrim.rate !== null ? String(apiTrim.rate) : "",
            quantityPerGmt: apiTrim.quantity !== null ? String(apiTrim.quantity) : "",
            inwardDuty: calculatedInwardDuty,
            gst: apiTrim.gst || "0%",
            trimCost: calculatedTrimCost,
          };
        });
        setTrimRows(updatedTrimRows.length > 0 ? updatedTrimRows : [{ trim: "", source: "Local", description: "", rate: "", quantityPerGmt: "", inwardDuty: 0, gst: "0%", trimCost: 0 }]);
      } else {
         setTrimRows([{ trim: "", source: "Local", description: "", rate: "", quantityPerGmt: "", inwardDuty: 0, gst: "0%", trimCost: 0 }]);
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
    let newFormData = { ...formData, [name]: value };

    if (name === "fobCurrency") {
      newFormData = { ...newFormData, exchangeRate: exchangeRates[value] };
    }
    if (name === "creditDays") {
      const financeCost = (11 * parseFloat(value || 0)) / 365;
      newFormData = { ...newFormData, financeCost: financeCost }; // Store as number
    }
    if (name === "shipTolerance") {
      const extrapolation = (parseFloat(value || 0) + totalProcessLoss); // totalProcessLoss is already a percentage
      newFormData = { ...newFormData, extrapolation: extrapolation}; // Store as number
    }
    
    // Recalculate INR Net FOB if FOB per piece, currency, commission, discount or finance cost changes
    if (["fobPerPiece", "fobCurrency", "agentCommission", "buyerDiscount", "creditDays"].includes(name) || name === "exchangeRate") {
        const fobPerPiece = name === "fobPerPiece" ? parseFloat(value) : parseFloat(newFormData.fobPerPiece) || 0;
        const currentExchangeRate = name === "fobCurrency" ? exchangeRates[value] : newFormData.exchangeRate;
        const agentComm = parseFloat(newFormData.agentCommission) || 0;
        const buyerDisc = parseFloat(newFormData.buyerDiscount) || 0;
        const finCost = newFormData.financeCost || 0; // Use the numeric financeCost

        const inrNetFob = fobPerPiece * currentExchangeRate * (1 - (agentComm / 100) - (buyerDisc / 100) - (finCost / 100));
        newFormData = { ...newFormData, inrNetFob: inrNetFob }; // Store as number
    }
    setFormData(newFormData);
  };
  
  useEffect(() => { // Effect to update extrapolation and INR Net FOB when dependent values change
    const newExtrapolation = (parseFloat(formData.shipTolerance || 0) + totalProcessLoss);
    
    const fobPerPiece = parseFloat(formData.fobPerPiece) || 0;
    const agentComm = parseFloat(formData.agentCommission) || 0;
    const buyerDisc = parseFloat(formData.buyerDiscount) || 0;
    const finCost = parseFloat(formData.financeCost) || 0;
    const currentExchangeRate = formData.exchangeRate || 1;

    const inrNetFob = fobPerPiece * currentExchangeRate * (1 - (agentComm / 100) - (buyerDisc / 100) - (finCost / 100));

    setFormData(prev => ({
        ...prev, 
        extrapolation: newExtrapolation,
        inrNetFob: inrNetFob
    }));
  }, [formData.shipTolerance, totalProcessLoss, formData.fobPerPiece, formData.exchangeRate, formData.agentCommission, formData.buyerDiscount, formData.financeCost]);


  const handleFabricChange = (index, e) => {
    const { name, value } = e.target;
    setFabricRows((prev) => {
      const updatedRows = [...prev];
      updatedRows[index] = { ...updatedRows[index], [name]: value };
      
      const rate = parseFloat(updatedRows[index].rate) || 0;
      const consumption = parseFloat(updatedRows[index].consumption) || 0;
      const inwardTransport = parseFloat(updatedRows[index].inwardTransport) || 0;

      updatedRows[index].fabricCost = rate * consumption;
      // Assuming inwardTransport is per unit of consumption
      updatedRows[index].fabricLandedCost = (rate * consumption) + (consumption * inwardTransport); 
      return updatedRows;
    });
  };

  const addFabricRow = () => {
    setFabricRows([...fabricRows, { fabricType: "", source: "Local", description: "", rate: "", consumption: "", fabricCost: 0, inwardTransport: "", gst: "0%", fabricLandedCost: 0 }]);
  };

  const totalFabricLandedCost = fabricRows.reduce((sum, row) => sum + (parseFloat(row.fabricLandedCost) || 0), 0);
  const inrNetFobNumeric = parseFloat(formData.inrNetFob) || 0;
  const totalFabricCostPercentToFOB = inrNetFobNumeric ? ((totalFabricLandedCost / inrNetFobNumeric) * 100) : 0;
  
  // This calculation was for sum of (fabricCost * GST %), re-evaluating its meaning.
  // If it's meant to be total GST amount on fabrics:
  const totalFabricGSTAmount = fabricRows.reduce((sum, row) => {
      const fabricCost = parseFloat(row.fabricCost) || 0;
      const gstPercentage = parseFloat(row.gst) / 100 || 0;
      return sum + (fabricCost * gstPercentage);
  }, 0);


  const handleTrimChange = (index, e) => {
    const { name, value } = e.target;
    setTrimRows((prev) => {
      const updatedRows = [...prev];
      updatedRows[index] = { ...updatedRows[index], [name]: value };

      const currentRate = parseFloat(updatedRows[index].rate) || 0;
      const currentQuantity = parseFloat(updatedRows[index].quantityPerGmt) || 0;
      
      let newInwardDuty = 0;
      if (updatedRows[index].source === 'Import') {
        newInwardDuty = currentRate * 0.25; // 25% of rate for import
      }
      updatedRows[index].inwardDuty = newInwardDuty;
      updatedRows[index].trimCost = (currentRate * currentQuantity) + newInwardDuty;
      
      return updatedRows;
    });
  };
  
  const addTrimRow = () => {
    setTrimRows([...trimRows, { trim: "", source: "Local", description: "", rate: "", quantityPerGmt: "", inwardDuty: 0, gst: "0%", trimCost: 0 }]);
  };

  const totalTrimsCost = trimRows.reduce((sum, row) => sum + (parseFloat(row.trimCost) || 0), 0);
  const sumInwardFreightDuty = trimRows.reduce((sum, row) => sum + (parseFloat(row.inwardDuty) || 0), 0);
  const trimsCostWithoutDuty = totalTrimsCost - sumInwardFreightDuty;
  const totalTrimsCostPercentToFOB = inrNetFobNumeric ? ((totalTrimsCost / inrNetFobNumeric) * 100) : 0;

  const handleValueAddChange = (index, e) => {
    const { name, value } = e.target; // Assuming name is 'cost'
    setValueAddRows((prev) => {
      const updatedRows = [...prev];
      updatedRows[index] = {...updatedRows[index], [name]: value};
      return updatedRows;
    });
  };

  const addValueAddRow = () => {
    setValueAddRows([...valueAddRows, { valueAdd: "", process: "", cost: "" }]);
  };


  const valueLossRejection = totalProcessLoss; // This is a percentage
  const valueLossRejectionInr = (valueLossRejection / 100) * inrNetFobNumeric;

  const otherChargesPercent = parseFloat(otherCharges[0]) || 0;
  const otherChargesInr = (otherChargesPercent / 100) * inrNetFobNumeric;
  
  const outwardTransportationPercent = parseFloat(outwardTransportation[0]) || 0;
  // outwardTransportation[1] is direct INR value, not calculated from FOB
  const outwardTransportationInr = parseFloat(outwardTransportation[1]) || 0;


  const totalValueAddCost = valueAddRows.reduce((sum, row) => sum + (parseFloat(row.cost) || 0), 0);
  const totalValueAddCostPercentToFOB = inrNetFobNumeric ? ((totalValueAddCost / inrNetFobNumeric) * 100) : 0;

  const totalSecondRowSum = valueLossRejectionInr + outwardTransportationInr + otherChargesInr;

  const totalVariableCostsCalc = totalFabricLandedCost + totalTrimsCost + totalValueAddCost  + totalSecondRowSum;
  const grossContributionPerGmt = inrNetFobNumeric - totalVariableCostsCalc;
  const totalVariableCostPercent = inrNetFobNumeric ? ((totalVariableCostsCalc / inrNetFobNumeric) * 100) : 0;
  const contributionPercent = inrNetFobNumeric ? ((grossContributionPerGmt / inrNetFobNumeric) * 100) : 0;
  
  const corporateOhs = inrNetFobNumeric * 0.1;
  
  const smvPerPcNum = parseFloat(formData.smvPerPc) || 0;
  const efficiencyNum = parseFloat(formData.efficiency) || 0;
  // Cost of Manufacturing (CM)
  // Ensure efficiency is not zero to avoid division by zero
  const costOfManufacturing = efficiencyNum ? ((smvPerPcNum * 5) / (efficiencyNum / 100)) - corporateOhs : -corporateOhs;


  const ebitdaPerPc = grossContributionPerGmt - corporateOhs - costOfManufacturing;
  const ebitdaPercentToFob = inrNetFobNumeric ? ((ebitdaPerPc / inrNetFobNumeric) * 100) : 0;
  const costPerMin = smvPerPcNum ? ((corporateOhs + costOfManufacturing) / smvPerPcNum) : 0;
  const gcPerStandardMin = smvPerPcNum ? (grossContributionPerGmt / smvPerPcNum) : 0;

  const pdfRef = useRef(); // Keep ref if used elsewhere, though not for this PDF generation

  const exportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    let yPos = 15;
    const pageMargin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const headingColor = [41, 128, 185]; // A nice blue for headings

    // --- PDF Title ---
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("Cost Sheet", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    const addContentHeading = (title, currentY) => {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(title, pageMargin, currentY);
        return currentY + 8; // Return new Y position for table/content start
    };
    
    const getFinalY = (fallbackY) => {
        return doc.autoTable.previous ? doc.autoTable.previous.finalY : fallbackY;
    }

    // --- General Information ---
    yPos = addContentHeading("General Information", yPos);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const generalInfoBody = Object.keys(formData).map(key => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
        let value = formData[key];
        if (typeof value === 'number') {
            // Handle specific formatting for numbers if needed, e.g. financeCost
            if (key === 'financeCost' || key === 'extrapolation' || key === 'actualExpBenefits' || key === 'maxExpBenefits') {
                value = parseFloat(value).toFixed(2);
            } else if (key === 'inrNetFob') {
                 value = parseFloat(value).toFixed(2);
            }
        }
        return [label, value !== undefined && value !== null ? String(value) : ""];
    });
    doc.autoTable({
        startY: yPos,
        head: [['Field', 'Value']],
        body: generalInfoBody,
        theme: 'grid',
        headStyles: { fillColor: headingColor, textColor: 255 },
        margin: { left: pageMargin, right: pageMargin },
        didDrawPage: (data) => { yPos = data.cursor.y + 5; } // Update yPos if page break
    });
    yPos = getFinalY(yPos) + 10;

    // --- Fabric Cost Table ---
    if(yPos > 260) { doc.addPage(); yPos = 15;} // Manual check for page break before new section
    yPos = addContentHeading("Fabric Costs", yPos);
    const fabricTableBody = fabricRows.map(row => [
        row.fabricType, row.source, row.description, String(row.rate), String(row.consumption),
        (parseFloat(row.fabricCost) || 0).toFixed(2), String(row.inwardTransport), row.gst, (parseFloat(row.fabricLandedCost) || 0).toFixed(2)
    ]);
    const fabricTableFooters = [
        [{ content: 'Total Fabric Landed Cost', colSpan: 8, styles: { halign: 'right', fontStyle: 'bold' } }, { content: totalFabricLandedCost.toFixed(2), styles: { fontStyle: 'bold' } }],
        [{ content: 'Total Fabric Cost % to FOB', colSpan: 8, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalFabricCostPercentToFOB.toFixed(2)}%`, styles: { fontStyle: 'bold' } }],
        [{ content: 'Total Fabric GST Amount', colSpan: 8, styles: { halign: 'right', fontStyle: 'bold' } }, { content: totalFabricGSTAmount.toFixed(2), styles: { fontStyle: 'bold' } }]
    ];
    doc.autoTable({
        startY: yPos,
        head: [['Fabric Type', 'Source', 'Description', 'Rate', 'Consumption', 'Fabric Cost', 'Inward Transport', 'GST', 'Fabric Landed Cost']],
        body: [...fabricTableBody, ...fabricTableFooters],
        theme: 'grid',
        headStyles: { fillColor: headingColor, textColor: 255 },
        margin: { left: pageMargin, right: pageMargin },
        didDrawPage: (data) => { yPos = data.cursor.y + 5; }
    });
    yPos = getFinalY(yPos) + 10;

    // --- Trim Cost Table ---
    if(yPos > 260) { doc.addPage(); yPos = 15;}
    yPos = addContentHeading("Trim Costs", yPos);
    const trimTableBody = trimRows.map(row => [
        row.trim, row.source, row.description, String(row.rate), String(row.quantityPerGmt),
        (parseFloat(row.inwardDuty) || 0).toFixed(2),
        row.gst, (parseFloat(row.trimCost) || 0).toFixed(2)
    ]);
    const trimTableFooters = [
        [{ content: 'Total Trims Cost', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold' } }, { content: totalTrimsCost.toFixed(2), styles: { fontStyle: 'bold' } }],
        [{ content: 'Sum Inward Freight & Duty', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold' } }, { content: sumInwardFreightDuty.toFixed(2), styles: { fontStyle: 'bold' } }],
        [{ content: 'Trims Cost Without Duty', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold' } }, { content: trimsCostWithoutDuty.toFixed(2), styles: { fontStyle: 'bold' } }],
        [{ content: 'Total Trims Cost % to FOB', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalTrimsCostPercentToFOB.toFixed(2)}%`, styles: { fontStyle: 'bold' } }]
    ];
    doc.autoTable({
        startY: yPos,
        head: [['Trims', 'Source', 'Description', 'Rate', 'Qty/Gmt', 'Inward Freight & Duty', 'GST', 'Trim Cost']],
        body: [...trimTableBody, ...trimTableFooters],
        theme: 'grid',
        headStyles: { fillColor: headingColor, textColor: 255 },
        margin: { left: pageMargin, right: pageMargin },
        didDrawPage: (data) => { yPos = data.cursor.y + 5; }
    });
    yPos = getFinalY(yPos) + 10;

    // --- Value Add & Process Table ---
    if(yPos > 260) { doc.addPage(); yPos = 15;}
    yPos = addContentHeading("Value Add & Process", yPos);
    const valueAddTableBody = valueAddRows.map(row => [
        row.valueAdd, row.process, (parseFloat(row.cost) || 0).toFixed(2)
    ]);
    const valueAddFooters = [
        [{ content: 'Total Value Add Cost/Gmt', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } }, { content: totalValueAddCost.toFixed(2), styles: { fontStyle: 'bold' } }],
        [{ content: 'Total Value Add Cost % to FOB', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalValueAddCostPercentToFOB.toFixed(2)}%`, styles: { fontStyle: 'bold' } }]
    ];
    doc.autoTable({
        startY: yPos,
        head: [['Value Add', 'Process Details', 'Value Add Cost/Gmt']],
        body: [...valueAddTableBody, ...valueAddFooters],
        theme: 'grid',
        headStyles: { fillColor: headingColor, textColor: 255 },
        margin: { left: pageMargin, right: pageMargin },
        didDrawPage: (data) => { yPos = data.cursor.y + 5; }
    });
    yPos = getFinalY(yPos) + 10;

    // --- Process Loss Table ---
    if(yPos > 260) { doc.addPage(); yPos = 15;}
    yPos = addContentHeading("Process Loss", yPos);
    const processLossTableBody = processLossData.map(row => [
        row.checked ? 'Yes' : 'No',
        row.description,
        `${(parseFloat(row.loss) || 0).toFixed(2)}%`
    ]);
    const processLossFooters = [
        [{ content: 'Total Process Loss %', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `${totalProcessLoss.toFixed(2)}%`, styles: { fontStyle: 'bold' } }]
    ];
    doc.autoTable({
        startY: yPos,
        head: [['Selected', 'Description', 'Process Loss %']],
        body: [...processLossTableBody, ...processLossFooters],
        theme: 'grid',
        headStyles: { fillColor: headingColor, textColor: 255 },
        margin: { left: pageMargin, right: pageMargin },
        didDrawPage: (data) => { yPos = data.cursor.y + 5; }
    });
    yPos = getFinalY(yPos) + 10;
    
    // --- Value Loss & Other Costs ---
    if(yPos > 260) { doc.addPage(); yPos = 15;}
    yPos = addContentHeading("Value Loss & Other Costs", yPos);
    const valueLossOtherCostsBody = [
        ['Value Loss / Rejection (%)', `${valueLossRejection.toFixed(2)}%`],
        ['Value Loss / Rejection (INR)', `${valueLossRejectionInr.toFixed(2)} INR`],
        ['Outward Transportation (%)', `${outwardTransportationPercent.toFixed(2)}%`],
        ['Outward Transportation (INR)', `${outwardTransportationInr.toFixed(2)} INR`],
        ['Other Charges (%)', `${otherChargesPercent.toFixed(2)}%`],
        ['Other Charges (INR)', `${otherChargesInr.toFixed(2)} INR`],
        [{content: 'Total Value Loss, Outward Transport & Other Charges (INR)', styles: {fontStyle: 'bold'}}, {content: `${totalSecondRowSum.toFixed(2)} INR`, styles: {fontStyle: 'bold'}}]
    ];
    doc.autoTable({
        startY: yPos,
        head: [['Description', 'Value']],
        body: valueLossOtherCostsBody,
        theme: 'grid',
        headStyles: { fillColor: headingColor, textColor: 255 },
        margin: { left: pageMargin, right: pageMargin },
        didDrawPage: (data) => { yPos = data.cursor.y + 5; }
    });
    yPos = getFinalY(yPos) + 10;

    // --- Summary ---
    if(yPos > 220) { doc.addPage(); yPos = 15;} // More space for summary
    yPos = addContentHeading("Summary", yPos);
    const summaryBody = [
        ['Total Variable Costs', `${totalVariableCostsCalc.toFixed(2)} INR`],
        ['Gross Contribution per Gmt', `${grossContributionPerGmt.toFixed(2)} INR`],
        ['Total Variable Cost % to FOB', `${totalVariableCostPercent.toFixed(2)}%`],
        ['Contribution % to FOB', `${contributionPercent.toFixed(2)}%`],
        ['Corporate OHs', `${corporateOhs.toFixed(2)} INR`],
        ['Cost of Manufacturing (CM)', `${costOfManufacturing.toFixed(2)} INR`],
        ['EBITDA per PC', `${ebitdaPerPc.toFixed(2)} INR`],
        ['EBITDA % to FOB', `${ebitdaPercentToFob.toFixed(2)}%`],
        ['Cost Per Min', `${costPerMin.toFixed(2)} INR`],
        ['GC per Standard Minute', `${gcPerStandardMin.toFixed(2)} INR`],
    ];
    doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryBody,
        theme: 'grid',
        headStyles: { fillColor: headingColor, textColor: 255 },
        margin: { left: pageMargin, right: pageMargin },
        didDrawPage: (data) => { yPos = data.cursor.y + 5; }
    });
    // yPos = getFinalY(yPos) + 10; // Not strictly needed after the last table

    doc.save("CostSheet_Data.pdf");
  };


  return (
    <div ref={pdfRef} className="cost-sheet-container">
      <h2 className="text-xl font-bold mb-4">Cost Sheet</h2>
      <div className="form-grid">
        {Object.keys(formData).map((key) => (
          <div key={key} className="form-group">
            <label className="block font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim()}:</label>
            {key === "segment" || key === "paymentTerms" || key === "complexity" || key === "fobCurrency" ? (
                <select name={key} value={formData[key]} onChange={handleChange} className="border p-2 w-full">
                {key === "segment" && ["Men", "Women", "Kids"].map((option) => <option key={option} value={option}>{option}</option>)}
                {/* Buyer and Product should be text inputs or dynamically populated, assuming text for now based on original code */}
                {/* {key === "buyer" && ["Hugo Boss", "Arrow", "Us Polo"].map((option) => <option key={option} value={option}>{option}</option>)} */}
                {/* {key === "product" && ["Shirt", "T-shirt", "Shorts", "Trousers"].map((option) => <option key={option} value={option}>{option}</option>)} */}
                {key === "paymentTerms" && ["Open Credit", "DA", "LC", "Advance"].map((option) => <option key={option} value={option}>{option}</option>)}
                {key === "complexity" && ["Low", "Medium", "High"].map((option) => <option key={option} value={option}>{option}</option>)}
                {key === "fobCurrency" && ["INR", "USD", "GBP", "EUR"].map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : (
              <input 
                type={ (typeof formData[key] === "number" && key !== "exchangeRate" && key !== "financeCost" && key !== "inrNetFob" && key !== "extrapolation" && key !== "actualExpBenefits" && key !== "maxExpBenefits" ) || 
                        key === "smvPerPc" || key === "fobPerPiece" || key === "creditDays" || key === "shipTolerance" || key === "orderQuantity" || key === "agentCommission" || key === "buyerDiscount" || key === "styleQuantity" || key === "piecesPerPack" || key === "efficiency"
                        ? "number" : "text"} 
                name={key} 
                value={ key === 'inrNetFob' || key === 'financeCost' ? (parseFloat(formData[key])||0).toFixed(2) : formData[key] } 
                onChange={handleChange} 
                className="border p-2 w-full"
                readOnly={key === "exchangeRate" || key === "inrNetFob" || key === "extrapolation" || key === "financeCost" || key === "actualExpBenefits" || key === "maxExpBenefits"} 
              />
            )}
          </div>
        ))}
      </div>
      
      <h3 className="text-lg font-bold mt-6">Fabric Cost Table</h3>
      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th>Fabric Type</th><th>Source</th><th>Description</th><th>Rate</th><th>Consumption</th><th>Fabric Cost</th><th>Inward Transport (per unit cons.)</th><th>GST</th><th>Fabric Landed Cost</th>
          </tr>
        </thead>
        <tbody>
          {fabricRows.map((row, index) => (
            <tr key={index}>
              <td><input type="text" name="fabricType" value={row.fabricType} onChange={(e) => handleFabricChange(index, e)} className="border p-1 w-full"/></td>
              <td>
                <select name="source" value={row.source} onChange={(e) => handleFabricChange(index, e)} className="border p-1 w-full">
                  <option value="Local">Local</option>
                  <option value="Import">Import</option>
                </select>
              </td>
              <td><input type="text" name="description" value={row.description} onChange={(e) => handleFabricChange(index, e)} className="border p-1 w-full"/></td>
              <td><input type="number" name="rate" value={row.rate} onChange={(e) => handleFabricChange(index, e)} className="border p-1 w-full"/></td>
              <td><input type="number" name="consumption" value={row.consumption} onChange={(e) => handleFabricChange(index, e)} className="border p-1 w-full"/></td>
              <td>{(parseFloat(row.fabricCost)||0).toFixed(2)}</td>
              <td><input type="number" name="inwardTransport" value={row.inwardTransport} onChange={(e) => handleFabricChange(index, e)} className="border p-1 w-full"/></td>
              <td>
                <select name="gst" value={row.gst} onChange={(e) => handleFabricChange(index, e)} className="border p-1 w-full">
                  <option value="5%">5%</option><option value="12%">12%</option><option value="18%">18%</option><option value="28%">28%</option><option value="0%">0%</option>
                </select>
              </td>
              <td>{(parseFloat(row.fabricLandedCost)||0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="8" className="text-right font-bold pr-2"><strong>Total Fabric Landed Cost</strong></td>
            <td>{totalFabricLandedCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="8" className="text-right font-bold pr-2"><strong>Total Fabric Cost % to FOB</strong></td>
            <td>{totalFabricCostPercentToFOB.toFixed(2)}%</td>
          </tr>
          <tr>
            <td colSpan="8" className="text-right font-bold pr-2"><strong>Total Fabric GST Amount</strong></td>
            <td>{totalFabricGSTAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <button onClick={addFabricRow} className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">+ Add Fabric Row</button>
    
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
              <td><input type="text" name="trim" value={row.trim} onChange={(e) => handleTrimChange(index, e)} className="border p-1 w-full"/></td>
              <td>
                <select name="source" value={row.source} onChange={(e) => handleTrimChange(index, e)} className="border p-1 w-full">
                  <option value="Local">Local</option>
                  <option value="Import">Import</option>
                </select>
              </td>
              <td><input type="text" name="description" value={row.description} onChange={(e) => handleTrimChange(index, e)} className="border p-1 w-full"/></td>
              <td><input type="number" name="rate" value={row.rate} onChange={(e) => handleTrimChange(index, e)} className="border p-1 w-full"/></td>
              <td><input type="number" name="quantityPerGmt" value={row.quantityPerGmt} onChange={(e) => handleTrimChange(index, e)} className="border p-1 w-full"/></td>
              <td>{(parseFloat(row.inwardDuty)||0).toFixed(2)}</td>
              <td>
                <select name="gst" value={row.gst} onChange={(e) => handleTrimChange(index, e)} className="border p-1 w-full">
                  <option value="5%">5%</option><option value="12%">12%</option><option value="18%">18%</option><option value="28%">28%</option><option value="0%">0%</option>
                </select>
              </td>
              <td>{(parseFloat(row.trimCost)||0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan="7" className="text-right font-bold pr-2"><strong>Total Trims Cost</strong></td><td>{totalTrimsCost.toFixed(2)}</td></tr>
          <tr><td colSpan="7" className="text-right font-bold pr-2"><strong>Sum Inward Freight & Duty</strong></td><td>{sumInwardFreightDuty.toFixed(2)}</td></tr>
          <tr><td colSpan="7" className="text-right font-bold pr-2"><strong>Trims Cost Without Duty</strong></td><td>{trimsCostWithoutDuty.toFixed(2)}</td></tr>
          <tr><td colSpan="7" className="text-right font-bold pr-2"><strong>Total Trims Cost % to FOB</strong></td><td>{totalTrimsCostPercentToFOB.toFixed(2)}%</td></tr>
        </tfoot>
      </table>
      <button onClick={addTrimRow} className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">+ Add Trim Row</button>

      <h3 className="text-lg font-bold mt-6">Value Add & Process Table</h3>
      <table className="w-full border mt-4">
        <thead><tr><th>Value Add</th><th>Process Details</th><th>Value Add Cost/Gmt</th></tr></thead>
        <tbody>
          {valueAddRows.map((row, index) => (
            <tr key={index}>
              <td><input type="text" name="valueAdd" value={row.valueAdd} onChange={(e) => handleValueAddChange(index, e)} disabled={!!row.process} className="border p-1 w-full"/></td>
              <td><input type="text" name="process" value={row.process} onChange={(e) => handleValueAddChange(index, e)} disabled={!!row.valueAdd} className="border p-1 w-full"/></td>
              <td><input type="number" name="cost" value={row.cost} onChange={(e) => handleValueAddChange(index, e)} className="border p-1 w-full"/></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
            <tr><td colSpan="2" className="text-right font-bold pr-2"><strong>Total Value Add Cost/Gmt</strong></td><td>{totalValueAddCost.toFixed(2)}</td></tr>
            <tr><td colSpan="2" className="text-right font-bold pr-2"><strong>Total Value Add Cost % to FOB</strong></td><td>{totalValueAddCostPercentToFOB.toFixed(2)}%</td></tr>
        </tfoot>
      </table>
      <button onClick={addValueAddRow} className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">+ Add ValueAdd Row</button>

      <h3 className="text-lg font-bold mt-6">Process Loss Table</h3>
      <table className="w-full border mt-4">
        <thead className="bg-gray-200"><tr><th className="p-2 border">Select</th><th className="p-2 border">Description</th><th className="p-2 border">Process Loss %</th></tr></thead>
        <tbody>
          {processLossData.map((row, index) => (
            <tr key={index} className="text-center">
              <td className="p-2 border"><input type="checkbox" checked={row.checked} onChange={() => handleCheckboxChange(index)} /></td>
              <td className="p-2 border text-left">{row.description}</td>
              <td className="p-2 border">{row.loss.toFixed(2)}%</td>
            </tr>
          ))}
          <tr className="font-bold"><td colSpan="2" className="p-2 border text-right">Total Process Loss %</td><td className="p-2 border text-center">{totalProcessLoss.toFixed(2)}%</td></tr>
        </tbody>
      </table>

      <h3 className="text-lg font-bold mt-6">Value Loss & Other Costs</h3>
      <table className="w-full border mt-4">
        <thead className="bg-gray-200">
            <tr>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Percentage (%)</th>
                <th className="p-2 border">Value (INR)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="p-2 border">Value Loss / Rejection</td>
                <td className="p-2 border">{valueLossRejection.toFixed(2)}%</td>
                <td className="p-2 border">{valueLossRejectionInr.toFixed(2)}</td>
            </tr>
            <tr>
                <td className="p-2 border">Outward Transportation</td>
                <td className="p-2 border"><input type="number" value={outwardTransportation[0]} onChange={(e) => setOutwardTransportation([e.target.value, outwardTransportation[1]])} className="w-full p-1 border rounded"/></td>
                <td className="p-2 border"><input type="number" value={outwardTransportation[1]} onChange={(e) => setOutwardTransportation([outwardTransportation[0], e.target.value])} className="w-full p-1 border rounded"/></td>
            </tr>
            <tr>
                <td className="p-2 border">Other Charges</td>
                <td className="p-2 border"><input type="number" value={otherCharges[0]} onChange={(e) => setOtherCharges([e.target.value, otherCharges[1]])} className="w-full p-1 border rounded"/></td>
                <td className="p-2 border">{otherChargesInr.toFixed(2)}</td>
            </tr>
            <tr className="font-bold">
                <td colSpan="2" className="p-2 border text-right">Total (Value Loss, Outward Transport, Other Charges in INR)</td>
                <td className="p-2 border">{totalSecondRowSum.toFixed(2)}</td>
            </tr>
        </tbody>
      </table>

      <h3 className="text-lg font-bold mt-6">Summary</h3>
      <table className="w-full border mt-4">
        <tbody>
            <tr><td className="p-2 border font-medium">Total Variable Costs</td><td className="p-2 border">{totalVariableCostsCalc.toFixed(2)} INR</td></tr>
            <tr><td className="p-2 border font-medium">Gross Contribution per Gmt</td><td className="p-2 border">{grossContributionPerGmt.toFixed(2)} INR</td></tr>
            <tr><td className="p-2 border font-medium">Total Variable Cost % to FOB</td><td className="p-2 border">{totalVariableCostPercent.toFixed(2)}%</td></tr>
            <tr><td className="p-2 border font-medium">Contribution % to FOB</td><td className="p-2 border">{contributionPercent.toFixed(2)}%</td></tr>
            <tr><td className="p-2 border font-medium">Corporate OHs (10% of INR Net FOB)</td><td className="p-2 border">{corporateOhs.toFixed(2)} INR</td></tr>
            <tr><td className="p-2 border font-medium">Cost of Manufacturing (CM)</td><td className="p-2 border">{costOfManufacturing.toFixed(2)} INR</td></tr>
            <tr><td className="p-2 border font-medium">EBITDA per PC</td><td className="p-2 border">{ebitdaPerPc.toFixed(2)} INR</td></tr>
            <tr><td className="p-2 border font-medium">EBITDA % to FOB</td><td className="p-2 border">{ebitdaPercentToFob.toFixed(2)}%</td></tr>
            <tr><td className="p-2 border font-medium">Cost Per Min</td><td className="p-2 border">{costPerMin.toFixed(2)} INR</td></tr>
            <tr><td className="p-2 border font-medium">GC per Standard Minute</td><td className="p-2 border">{gcPerStandardMin.toFixed(2)} INR</td></tr>
        </tbody>
      </table>
      <button onClick={exportPDF} className="export-pdf-btn mt-6 p-2 bg-green-500 text-white rounded hover:bg-green-600">Export as PDF (Data)</button>
    </div>
  );
};

export default CostSheetHeader;
