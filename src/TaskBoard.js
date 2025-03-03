  import React, { useState, useEffect } from "react";
  import "./TaskBoard.css";
  import deleteIcon from "./assets/delete.png"; // Import delete icon

  const GARMENT_TYPES = ['Shirt', 'T-Shirt', 'Shorts', 'Trousers'];
  const SAMPLE_TYPES = ['Fit Sample', 'PP Sample', 'SMS', 'Photoshoot Sample', 'TOP Sample', 'FOB Sample'];
  const BRAND = ['Hugo Boss', 'Arrow', 'US Polo'];

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
      steps: {
        start: false,
        indent: false,
        pattern: false,
        fabric: false,
        embroidery: false,
        packing: false,
        Problem: false,
      },
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
      garment:"",
      status: "toBeDone",
    });

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
        .then((data) => setTasks(data))
        .catch((error) => console.error("Error fetching tasks:", error));
    }, []);
    
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

    // Function to handle task step checkbox changes
    const handleCheckboxChange = (taskId, step) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskId) {
            const updatedSteps = { ...task.steps, [step]: !task.steps[step] };
            let progress = calculateProgress(updatedSteps);
            let updatedStatus = progress === 100 && !updatedSteps.Problem ? "completed" : "inProgress";
            if (updatedStatus !== "completed")
              triggerNotification("Process completed - " + step)
            else 
              triggerNotification("This style has been completed")
            // API Call to update task in DB
            fetch(`http://localhost:5000/tasks/${taskId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ steps: updatedSteps , status : updatedStatus}),
            }).catch(error => console.error("Error updating task:", error));
    
            return { ...task, steps: updatedSteps, progress, status: updatedStatus };
          }
          return task;
        })
      );
    };
    
    // Function to update task comment
    const handleCommentChange = (taskId, comment) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, comment } : task
        )
      );
    };

    // Function to report a Problem
    const reportProblem = (taskId) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, status: "pending", ProblemReported: true }
            : task
        )
      );
      triggerNotification("This style could not be completed due to a Problem")
    };

    const calculateProgress = (steps) => {
      let progress = 0;
      if (steps.Indent) progress += 10;
      if (steps.PatternCutting) progress += 15;
      if (steps.FabricCutting) progress += 20;
      if (steps.Sewing) progress += 25;
      if (steps.Embroidery) progress += 15;
      if (steps.Finishing) progress += 15;

      // if (steps.indent) progress += 10;
      // if (steps.pattern) progress += 20;
      // if (steps.fabric) progress += 30;
      // if (steps.embroidery) progress += 20;
      // if (steps.packing) progress += 20;

      return progress;
    };

    const markAsCompleted = (taskId) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: "completed" } : task
        )
      );
    };

    useEffect(() => {
      const interval = setInterval(() => {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (
              task.status === "inProgress" &&
              new Date() - new Date(task.timestamp) > 4 * 60 * 60 * 1000
            ) {
              return { ...task, status: "pending" };
            }
            return task;
          })
        );
      }, 60000);
      return () => clearInterval(interval);
    }, []);

    // Function to add a new task
    const addTask = (status) => {
      if (!newTaskData.styleNumber || !newTaskData.brand || !newTaskData.sampleType || !newTaskData.garment) {
        alert("Please fill in all fields!");
        return;
      }
    
      const newTask = {
        styleNumber: newTaskData.styleNumber,
        status: status,
        brand: newTaskData.brand,
        sampleType : newTaskData.sampleType,
        garment: newTaskData.garment
      };
    
      fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      })
      .then(response => response.json())
      .then(() => {
        setTasks((prevTasks) => [...prevTasks, newTask]); 
        setIsModalOpen(false);
      })
      .catch(error => console.error("Error adding task:", error));
    };
        // Function to delete a task
    const deleteTask = (taskId) => {
      fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "DELETE",
      })
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== taskId));
      })
      .catch(error => console.error("Error deleting task:", error));
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
              .map((task) => (
                <div key={task.id} className="task-card">
                  <h3 className="task-title">
                    <strong>Style:</strong> {task.styleNumber} <br />
                    <strong>Brand:</strong> {task.brand} <br />
                    <strong>Sample Type:</strong> {task.sampleType} <br />
                    <strong>Garment:</strong> {task.garment}
                  </h3>

                  {status === "toBeDone" && (
                    <label className="task-step">
                      <input
                        type="checkbox"
                        checked={task.steps.Start}
                        onChange={() => handleCheckboxChange(task.id, "Start")}
                      />
                      <span>Start</span>
                    </label>
                  )}

                  {status === "inProgress" && (
                    <div className="task-steps">
                      {Object.keys(task.steps)
                        .filter((step) => step !== "Start")
                        .map((step) => (
                          <label key={step} className="task-step">
                            <input
                              type="checkbox"
                              checked={task.steps[step]}
                              onChange={() => handleCheckboxChange(task.id, step)}
                            />
                            <span>{step}</span>
                          </label>
                        ))}
                    </div>
                  )}

                  {status === "inProgress" && task.steps.Problem && !task.ProblemReported && (
                    <>
                      <textarea
                        className="Problem-comment"
                        placeholder="Describe the Problem..."
                        value={task.comment}
                        onChange={(e) => handleCommentChange(task.id, e.target.value)}
                      />
                      <button onClick={() => reportProblem(task.id)} className="done-button">
                        Done
                      </button>
                    </>
                  )}

                  {status === "inProgress" && (
                    <>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <p className="progress-text">Progress: {task.progress}%</p>
                    </>
                  )}

                  {status === "pending" && (
                    <label className="task-step">
                    <input
                      type="checkbox"
                      onChange={() => markAsCompleted(task.id)}
                    />
                      <span>Done / Rectified</span>
                  </label>
                  )}

                  {/* Delete Task Button */}
                    <button className="delete-task-button" onClick={() => deleteTask(task.id)}>
                      <img src={deleteIcon} alt="Delete" width={20} height={20} />
                    </button>
                  </div>
              ))}

            {/* Add Task button */}
            <button onClick={() => openModal(status)} className="add-task-button">
              + Add Task
            </button>
          </div>
        ))}

        {/* Modal */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Add New Task</h3>
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
