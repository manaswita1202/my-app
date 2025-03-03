import React, { useState } from "react";
import { Gantt, Task,ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./GanttChart.css";
import { useOutletContext } from "react-router-dom";

const processColors = {
  "Order Receipt": "#FF5733",  // Red
  "CAD Consumption": "#c51aa3", //Magenta
  "BOM Generation": "#391ac5", //Dark blue
  "PO Issue for Fabric & Trims": "#1a9dc5", //Ocean blue
  "Fabric Received": "#33FF57", // Green
  "Sample Indent Made": "#ebd50b", //Camel yellow
  "Pattern Cutting": "#3380FF", // Blue
  "Sewing": "#FFC300", // Yellow
  "Embroidery": "#aa3c6f", //Lily pink
  "Finishing": "#9B59B6", // Purple
  "Packing": "#2ECC71", // Emerald
  "Documentation in PLM": "#3caa85",
  "Dispatch": "#E74C3C", // Dark Red
};


const GanttChart = () => {
  const [tasks, setTasks] = useState([]);
  const context = useOutletContext(); // Get context safely



  const { activityData } = context; 
  console.log(activityData)
  useState(() => {
    if (activityData.length > 0) {
      const formattedTasks = activityData.map((item, index) => ({
        id: index.toString(),
        name: item.process,
        start: new Date(item.plannedStart !== '' ? item.plannedStart : null),
        end: new Date(item?.plannedEnd !== '' ? item.plannedEnd : null),
        type: "task",
        progress: 0,
        isDisabled: true,
        styles: {
          progressColor: processColors[item.process] || "#c20e35", // Default Blue
          backgroundColor: processColors[item.process] || "#c51aa3"
        }
      }));
      setTasks(formattedTasks);
    }
  }, [activityData]);

  console.log(tasks)
  return (
    <div className="gantt-container">
      <h2>Gantt Chart</h2>
      <Gantt tasks={tasks}
      viewMode={ViewMode.Day}
      listCellWidth={""} // Remove task list columns (Start/End)

      />
    </div>
  );
};

export default GanttChart;
