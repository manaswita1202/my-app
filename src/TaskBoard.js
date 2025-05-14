import React, { useState, useEffect } from "react";
import "./TaskBoard.css";
import deleteIcon from "./assets/delete.png"; // Import delete icon

const GARMENT_TYPES = ['Shirt', 'T-Shirt', 'Shorts', 'Trousers'];
const SAMPLE_TYPES = ['Fit Sample', 'PP Sample', 'SMS', 'Photoshoot Sample', 'TOP Sample', 'FOB Sample'];
const BRAND = ['Hugo Boss', 'Arrow', 'US Polo'];

// Define a sequence of steps for the manufacturing process
// NOTE: API responses show dynamic step names. This static sequence might need re-evaluation
// for functions like getNextProcess if step names vary significantly per task.
const PROCESS_SEQUENCE = ["Start", "indent", "pattern", "fabric", "embroidery", "packing", "Problem"];

const initialTasks = [
  {
    id: 1,
    styleNumber: "SSS234",
    brand: "Hugo Boss",
    sampleType: "Fit Sample",
    garment: "Shirt",
    progress: 0,
    priority: "High",
    status: "toBeDone",
    timestamp: new Date().toISOString(),
    steps: [ // MODIFIED: Steps as an array of objects
      { step_name: "Start", is_completed: false },
      { step_name: "indent", is_completed: false },
      { step_name: "pattern", is_completed: false },
      { step_name: "fabric", is_completed: false },
      { step_name: "embroidery", is_completed: false },
      { step_name: "packing", is_completed: false },
      { step_name: "Problem", is_completed: false },
    ],
    comment: "",
    ProblemReported: false, // Track if Problem has been reported
  },
];

const TaskBoard = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    styleNumber: "",
    brand: "",
    sampleType: "",
    garment: "",
    status: "toBeDone",
  });
  const [activityData, setActivityData] = useState({});

  const triggerNotification = async (message) => {
    try {
      await fetch("http://localhost:5000/api/notifications", {
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

  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then((response) => response.json())
      .then((data) => {
        // Assuming data from API is already in the new format:
        // [{ ..., steps: [{step_name: "...", is_completed: ...}, ...] }]
        setTasks(data);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  const fetchActivityData = (styleNumber) => {
    fetch(`http://localhost:5000/api/activity/${styleNumber}`)
      .then((response) => response.json())
      .then((data) => {
        setActivityData(prev => ({
          ...prev,
          [styleNumber]: data
        }));
      })
      .catch((error) => console.error("Error fetching activity data:", error));
  };

  useEffect(() => {
    tasks.forEach(task => {
      if (task.styleNumber) { // Ensure styleNumber exists
        fetchActivityData(task.styleNumber);
      }
    });
  }, [tasks]);

  const openModal = (status) => {
    setNewTaskData({ styleNumber: "", brand: "", sampleType: "", garment: "", status });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const getNextProcess = (currentProcess) => {
    // Ensure PROCESS_SEQUENCE aligns with actual step_names from API for this to be effective
    const currentIndex = PROCESS_SEQUENCE.findIndex(
      (p) => p.toLowerCase() === currentProcess.toLowerCase()
    );
    
    if (currentIndex !== -1 && currentIndex < PROCESS_SEQUENCE.length - 1) {
      return PROCESS_SEQUENCE[currentIndex + 1];
    }
    return null;
  };

  // MODIFIED: calculateProgress to work with steps array
  // Calculates progress based on completion of non-"Problem" steps.
  const calculateProgress = (stepsArray) => {
    if (!stepsArray) return 0;
    const relevantSteps = stepsArray.filter(s => s.step_name !== "Problem");
    if (relevantSteps.length === 0) return 0;

    const completedCount = relevantSteps.filter(s => s.is_completed).length;
    const progress = (completedCount / relevantSteps.length) * 100;
    return Math.round(progress);
  };

  const handleCheckboxChange = (taskId, stepName) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedSteps = task.steps.map(s =>
            s.step_name === stepName ? { ...s, is_completed: !s.is_completed } : s
          );

          let newProgress = calculateProgress(updatedSteps);
          const problemStep = updatedSteps.find(s => s.step_name === "Problem");
          const isProblemActive = problemStep ? problemStep.is_completed : false;

          let newStatus = "inProgress"; // Default status after a change

          if (newProgress === 100 && !isProblemActive) {
            newStatus = "completed";
          } else if (isProblemActive) {
             // If problem is active, task is not completed, remains/becomes inProgress
             // reportProblem() function handles moving to "pending"
            newStatus = "inProgress";
          }


          // Handle transition from "toBeDone" when "Start" step is checked
          const startStep = updatedSteps.find(s => s.step_name === "Start");
          if (task.status === "toBeDone" && startStep && startStep.is_completed) {
            if (newStatus !== "completed") { // Avoid overriding if it became completed in one go
                newStatus = "inProgress";
            }
          } else if (task.status === "toBeDone" && (!startStep || !startStep.is_completed)) {
            newStatus = "toBeDone"; // Remain toBeDone if Start not completed
          }


          const isChecked = updatedSteps.find(s => s.step_name === stepName)?.is_completed;
          const nextProcess = getNextProcess(stepName);
          updateActivityData(task.styleNumber, stepName, isChecked, nextProcess);
          
          if (newStatus === "completed") {
            triggerNotification(`Style ${task.styleNumber} has been completed`);
          } else if (isChecked) { // Only notify on check, not uncheck, unless it's completion
            triggerNotification(`Process ${stepName} for ${task.styleNumber} marked as done.`);
          }


          fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ steps: updatedSteps, status: newStatus, progress: newProgress }), // Send new progress too
          }).catch(error => console.error("Error updating task:", error));
          
          // Note: task.ProblemReported is handled by reportProblem and markAsCompleted functions
          return { ...task, steps: updatedSteps, progress: newProgress, status: newStatus };
        }
        return task;
      })
    );
  };

  const updateActivityData = (styleNumber, process, isChecked, nextProcess) => {
    fetch("http://localhost:5000/api/activity/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        style: styleNumber,
        process: process,
        isChecked: isChecked,
        nextProcess: nextProcess
      }),
    })
    .then((response) => response.json())
    .then(() => {
      fetchActivityData(styleNumber);
    })
    .catch((error) => console.error("Error updating activity data:", error));
  };
  
  const handleCommentChange = (taskId, comment) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, comment } : task
      )
    );
    // Persist comment change to backend if necessary
    fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: comment }),
    }).catch(error => console.error("Error updating task comment:", error));
  };

  const reportProblem = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          // Mark the "Problem" step as active in the task's steps array
          const updatedSteps = task.steps.map(s =>
            s.step_name === "Problem" ? { ...s, is_completed: true } : s
          );
          
          updateActivityData(task.styleNumber, "Problem", true, null); // For activity log
          
          fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                steps: updatedSteps, // Send updated steps
                status: "pending", 
                ProblemReported: true, 
                comment: task.comment // Ensure comment is also sent if updated via textarea
            }),
          }).catch(error => console.error("Error reporting problem on task:", error));

          triggerNotification(`Problem reported for style ${task.styleNumber}. Status set to Pending.`);
          return { ...task, steps: updatedSteps, status: "pending", ProblemReported: true };
        }
        return task;
      })
    );
  };

  // MODIFIED: markAsCompleted to update steps array and ProblemReported
  const markAsCompleted = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId && task.status === "pending") { // Only from pending
          // Mark "Problem" step as resolved (is_completed: false)
          const updatedSteps = task.steps.map(s =>
            s.step_name === "Problem" ? { ...s, is_completed: false } : s
          );
          
          // Assuming problem resolution means the "Problem" activity ends
          updateActivityData(task.styleNumber, "Problem", false, null); // false indicates problem resolved

          // All other non-problem steps should ideally be complete.
          // The status directly becomes "completed".
          const newProgress = calculateProgress(updatedSteps); // Recalculate progress

          fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                steps: updatedSteps, 
                status: "completed", 
                ProblemReported: false,
                progress: newProgress
            }),
          }).catch(error => console.error("Error updating task for problem resolution:", error));
          
          triggerNotification(`Style ${task.styleNumber} has been marked as completed after problem resolution.`);
          return { ...task, steps: updatedSteps, status: "completed", ProblemReported: false, progress: newProgress };
        }
        return task;
      })
    );
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setTasks((prevTasks) =>
  //       prevTasks.map((task) => {
  //         if (
  //           task.status === "inProgress" &&
  //           new Date() - new Date(task.timestamp) > 4 * 60 * 60 * 1000 && // 4 hours
  //           !task.ProblemReported // Only if no problem is already formally reported
  //         ) {
  //           // Automatically move to pending if overdue and not already a reported problem
  //           // You might want to also mark the "Problem" step as true here and PUT to backend
  //           console.warn(`Task ${task.styleNumber} is overdue and moved to pending.`);
  //           // This is an automatic state change, might need more robust handling (e.g. dedicated Problem type)
  //           return { ...task, status: "pending" }; 
  //         }
  //         return task;
  //       })
  //     );
  //   }, 60000); // Check every minute
  //   return () => clearInterval(interval);
  // }, []);

  const addTask = (status) => {
    if (!newTaskData.styleNumber || !newTaskData.brand || !newTaskData.sampleType || !newTaskData.garment) {
      alert("Please fill in all fields!");
      return;
    }
  
    // For a new task, the backend should initialize its steps.
    // The frontend optimistic update will not have steps initially, until refresh or specific fetch.
    const taskPayload = {
      styleNumber: newTaskData.styleNumber,
      status: status, // Initial status, e.g., "toBeDone"
      brand: newTaskData.brand,
      sampleType: newTaskData.sampleType,
      garment: newTaskData.garment,
      priority: "Medium", // Default priority
      comment: "",
      ProblemReported: false,
      // `steps` and `progress` will be initialized by the backend.
      // Or, if you want optimistic update with steps, you need to define them here based on task type.
    };
  
    fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskPayload),
    })
    .then(response => response.json())
    .then((addedTaskWithDetails) => { // Assuming backend returns the full task object including ID and initialized steps
      setTasks((prevTasks) => [...prevTasks, addedTaskWithDetails]); 
      setIsModalOpen(false);
      setNewTaskData({ styleNumber: "", brand: "", sampleType: "", garment: "", status: "toBeDone" });// Reset form
      
      // Create initial activity records if your backend expects this upon new task creation
      // Ensure PROCESS_SEQUENCE is relevant or pass API-driven steps if available
      if (addedTaskWithDetails.steps && addedTaskWithDetails.steps.length > 0) {
        const stepNamesForActivity = addedTaskWithDetails.steps.map(s => s.step_name);
        createInitialActivityRecords(addedTaskWithDetails.styleNumber, stepNamesForActivity);
      } else {
        // Fallback if steps aren't returned, or use a default like PROCESS_SEQUENCE
        createInitialActivityRecords(addedTaskWithDetails.styleNumber, PROCESS_SEQUENCE);
      }
      triggerNotification(`New task ${addedTaskWithDetails.styleNumber} added.`);
    })
    .catch(error => console.error("Error adding task:", error));
  };

  const createInitialActivityRecords = (styleNumber, stepList) => {
    fetch("http://localhost:5000/api/activity/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        style: styleNumber,
        processes: stepList // Send actual step names for this task
      }),
    })
    .catch(error => console.error("Error creating activity records:", error));
  };

  const deleteTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "DELETE",
    })
    .then(() => {
      setTasks(tasks.filter((task) => task.id !== taskId));
      if(taskToDelete) triggerNotification(`Task ${taskToDelete.styleNumber} deleted.`);
    })
    .catch(error => console.error("Error deleting task:", error));
  };
  
  const displayActivityInfo = (task, stepName) => {
    if (!activityData[task.styleNumber]) return null;
    
    const activity = activityData[task.styleNumber].find(
      (a) => a.process.toLowerCase() === stepName.toLowerCase() // Match activity process name
    );
    
    if (!activity) return null;
    
    return (
      <div className="activity-timing">
        {activity.actual_start && (
          <small>Started: {formatDateTime(activity.actual_start)}</small>
        )}
        {activity.actual_end && (
          <small>Ended: {formatDateTime(activity.actual_end)}</small>
        )}
        {activity.actual_duration != null && ( // Check for null or undefined
          <small>Duration: {activity.actual_duration.toFixed(2)} hours</small>
        )}
        {activity.delay != null && activity.delay > 0 && (
          <small className="delay">Delay: {activity.delay.toFixed(2)} hours</small>
        )}
      </div>
    );
  };
  
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  return (
    <div className="task-board">
      {["toBeDone", "inProgress", "pending", "completed"].map((status) => (
        <div key={status} className="task-section">
          <h2 className="section-title">
            {status === "toBeDone"
              ? "Task To Be Done"
              : status === "inProgress"
              ? "In Progress"
              : status === "pending"
              ? "Pending"
              : "Completed"}{" "}
            ({tasks.filter((t) => t.status === status).length})
          </h2>

          {tasks
            .filter((task) => task.status === status)
            .map((task) => {
              // Ensure task.steps exists and is an array
              const currentTaskSteps = Array.isArray(task.steps) ? task.steps : [];
              const startStep = currentTaskSteps.find(s => s.step_name === "Start");
              const problemStep = currentTaskSteps.find(s => s.step_name === "Problem");

              return (
                <div key={task.id} className="task-card">
                  <h3 className="task-title">
                    <strong>Style:</strong> {task.styleNumber} <br />
                    <strong>Brand:</strong> {task.brand} <br />
                    <strong>Sample Type:</strong> {task.sampleType} <br />
                    <strong>Garment:</strong> {task.garment}
                  </h3>

                  {status === "toBeDone" && startStep && ( // MODIFIED: Check startStep existence
                    <div className="task-step-container">
                      <label className="task-step">
                        <input
                          type="checkbox"
                          checked={startStep.is_completed}
                          onChange={() => handleCheckboxChange(task.id, "Start")}
                        />
                        <span>Start</span>
                      </label>
                      {displayActivityInfo(task, "Start")}
                    </div>
                  )}

                  {status === "inProgress" && ( // MODIFIED: Iterate through steps array
                    <div className="task-steps">
                      {currentTaskSteps
                        .filter((stepObj) => stepObj.step_name !== "Start") // Original logic: filter out Start
                        .map((stepObj) => (
                          <div key={stepObj.step_name} className="task-step-container">
                            <label className="task-step">
                              <input
                                type="checkbox"
                                checked={stepObj.is_completed}
                                onChange={() => handleCheckboxChange(task.id, stepObj.step_name)}
                                disabled={task.ProblemReported && stepObj.step_name !== "Problem"} // Disable other steps if problem reported
                              />
                              <span>{stepObj.step_name}</span>
                            </label>
                            {displayActivityInfo(task, stepObj.step_name)}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* MODIFIED: Condition for Problem comment area */}
                  {status === "inProgress" && problemStep && problemStep.is_completed && !task.ProblemReported && (
                    <>
                      <textarea
                        className="Problem-comment"
                        placeholder="Describe the Problem to formally report it..."
                        value={task.comment || ""} // Ensure value is controlled
                        onChange={(e) => handleCommentChange(task.id, e.target.value)}
                      />
                      <button onClick={() => reportProblem(task.id)} className="done-button report-problem-button">
                        Report Problem
                      </button>
                    </>
                  )}
                  
                  {/* Display comment if problem is reported and task is pending */}
                  {status === "pending" && task.ProblemReported && task.comment && (
                    <div className="problem-display">
                        <strong>Problem Reported:</strong>
                        <p>{task.comment}</p>
                    </div>
                  )}


                  {status === "inProgress" && (
                    <>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{ width: `${task.progress || 0}%` }} // Use task.progress, default to 0
                        ></div>
                      </div>
                      <p className="progress-text">Progress: {task.progress || 0}%</p>
                    </>
                  )}

                  {status === "pending" && task.ProblemReported && ( // Only show if a problem was formally reported
                    <label className="task-step">
                    <input
                      type="checkbox"
                      onChange={() => markAsCompleted(task.id)}
                    />
                      <span>Problem Rectified / Mark as Completed</span>
                    </label>
                  )}

                  <button className="delete-task-button" onClick={() => deleteTask(task.id)}>
                    <img src={deleteIcon} alt="Delete" width={20} height={20} />
                  </button>
                </div>
              )
            })}

          <button onClick={() => openModal(status)} className="add-task-button">
            + Add Task
          </button>
        </div>
      ))}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Task to {newTaskData.status === "toBeDone" ? "Task To Be Done" : newTaskData.status}</h3>
            <label>Style Number:</label>
            <input type="text" name="styleNumber" value={newTaskData.styleNumber} onChange={handleInputChange} />

            <label>Brand:</label>
            <select name="brand" value={newTaskData.brand} onChange={handleInputChange}>
            <option value="">Select Brand</option>
              {BRAND.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              </select>
            <label>Sample Type:</label>
            <select name="sampleType" value={newTaskData.sampleType} onChange={handleInputChange}>
            <option value="">Select Sample Type</option>
              {SAMPLE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              </select>
            <label>Garment:</label>
            <select name="garment" value={newTaskData.garment} onChange={handleInputChange}>
            <option value="">Select Garment Type</option>
              {GARMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              </select>

            <div className="modal-buttons">
            <button onClick={() => addTask(newTaskData.status)}>Add Task</button>
            <button onClick={closeModal} className="cancel-button">Cancel</button>
          </div>

          </div>
        </div>
      )}
    </div>
  );
}; 

export default TaskBoard;