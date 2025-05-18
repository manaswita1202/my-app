import React, { useState, useEffect } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import "./GanttChart.css";

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

const getRandomColor = () => {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`;
};

const GanttChart = () => {
  const [styles, setStyles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [viewMode, setViewMode] = useState(ViewMode.Week);

  // Fetch all styles on component mount
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await fetch('https://samplify-backend-production.up.railway.app/styles');
        if (response.ok) {
          const data = await response.json();
          setStyles(data);
          
          // Generate tasks for styles overview
          const styleTasks = data.map((style, index) => ({
            id: `style-${style.id}`,
            name: `${style.styleNumber} (${style.brand})`,
            start: style.orderReceivedDate ? new Date(style.orderReceivedDate) : new Date(),
            end: style.orderDeliveryDate ? new Date(style.orderDeliveryDate) : new Date(),
            type: "task",
            progress: 0,
            isDisabled: false,
            styles: {
              progressColor: getRandomColor(),
              backgroundColor: getRandomColor()
            },
            project: style.styleNumber
          }));
          
          setTasks(styleTasks);
        } else {
          console.error("Failed to fetch styles");
        }
      } catch (error) {
        console.error("Error fetching styles:", error);
      }
    };
    
    fetchStyles();
  }, []);

  // Fetch activities for a specific style when selected
  const fetchStyleActivities = async (styleNumber) => {
    try {
      const response = await fetch(`https://samplify-backend-production.up.railway.app/api/activity?style=${styleNumber}`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform activity data into Gantt tasks
        const activityTasks = data.map((activity, index) => ({
          id: `activity-${activity.id}`,
          name: activity.process,
          start: activity.plannedStart ? new Date(activity.plannedStart) : null,
          end: activity.plannedEnd ? new Date(activity.plannedEnd) : null,
          type: "task",
          progress: activity.actualEnd ? 100 : (activity.actualStart ? 50 : 0),
          isDisabled: false,
          styles: {
            progressColor: processColors[activity.process] || "#c20e35",
            backgroundColor: processColors[activity.process] || "#c51aa3"
          },
          project: styleNumber
        })).filter(task => task.start && task.end); // Filter out tasks with missing dates
        
        setTasks(activityTasks);
        setSelectedStyle(styleNumber);
      } else {
        console.error("Failed to fetch activities for style:", styleNumber);
      }
    } catch (error) {
      console.error("Error fetching style activities:", error);
    }
  };

  // Handle task bar click
  const handleTaskClick = (task) => {
    // If it's a style task, fetch its activities
    if (task.id.startsWith('style-')) {
      fetchStyleActivities(task.project);
    }
  };

  // Handle back button click to return to styles overview
  const handleBackToStyles = () => {
    setSelectedStyle(null);
    // Regenerate style tasks
    const styleTasks = styles.map((style, index) => ({
      id: `style-${style.id}`,
      name: `${style.styleNumber} (${style.brand})`,
      start: style.orderReceivedDate ? new Date(style.orderReceivedDate) : new Date(),
      end: style.orderDeliveryDate ? new Date(style.orderDeliveryDate) : new Date(),
      type: "task",
      progress: 0,
      isDisabled: false,
      styles: {
        progressColor: "#1E90FF",
        backgroundColor: "#4682B4"
      },
      project: style.styleNumber
    }));
    
    setTasks(styleTasks);
  };

  // Handle view mode change
  const handleViewModeChange = (e) => {
    const mode = e.target.value;
    setViewMode(mode);
  };

  return (
    <div className="gantt-container">
      <div className="gantt-header">
        <h2>Gantt Chart</h2>
        <div className="gantt-controls">
          {selectedStyle && (
            <button onClick={handleBackToStyles} className="back-button">
              ← Back to Styles Overview
            </button>
          )}
          <select
            value={viewMode}
            onChange={handleViewModeChange}
            className="view-mode-select"
          >
            <option value={ViewMode.Hour}>Hour</option>
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </div>
      
      {selectedStyle ? (
        <h3>Activities for Style: {selectedStyle}</h3>
      ) : (
        <h3>All Styles Overview (Click on a style to see activities)</h3>
      )}
      
      {tasks.length > 0 ? (
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          onDoubleClick={handleTaskClick}
          onClick={handleTaskClick}
          listCellWidth=""
          columnWidth={60}
        />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default GanttChart;