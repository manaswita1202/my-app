import React, { useState, useEffect } from "react";
import "./CalendarToDo.css";
import { useOutletContext } from "react-router-dom";

const getFormattedDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB");
};

const generateCalendar = (daysAhead = 60) => {
  const calendar = {};
  const today = new Date();

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const formattedDate = getFormattedDate(date);
    calendar[formattedDate] = [];
  }
  return calendar;
};

const CalendarToDo = () => {
  const [tasks, setTasks] = useState(generateCalendar(60));
  const context = useOutletContext(); // Get context safely


  const { activityData } = context; 

  console.log("Received activityData:", activityData); // Debugging
  const displayDate = (dateString) => {
    const date = new Date(dateString).toLocaleDateString("en-GB");
    return date === "Invalid Date" ?  '' : date
  };


  useEffect(() => {
    if (!activityData || activityData.length === 0) return;

    const taskMap = { ...generateCalendar(60) };
    activityData.forEach((activity) => {
      if (!activity.plannedStart) return;

      const formattedDate = displayDate(activity?.plannedStart);

      if (!taskMap[formattedDate]) {
        taskMap[formattedDate] = [];
      }

      taskMap[formattedDate].push({
        id: activity.id || Math.random().toString(),
        process: activity.process || "Unknown Process",
        done: activity.actualEnd ? true : false,
        delay: activity.delay
      });
    });

    console.log("Updated tasks:", taskMap); // Debugging

    setTasks(taskMap);
  }, [activityData]);

  const handleTaskToggle = (date, taskId) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[date] = updatedTasks[date].map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      );
      return updatedTasks;
    });
  };

  const handleTaskEdit = (date, taskId, newText) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[date] = updatedTasks[date].map((task) =>
        task.id === taskId ? { ...task, process: newText } : task
      );
      return updatedTasks;
    });
  };

  const handleAddTask = (date) => {
    const newTask = {
      id: Math.random().toString(),
      process: "New Task",
      done: false,
      delay: 0,
    };

    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[date] = [...updatedTasks[date], newTask];
      return updatedTasks;
    });
  };

  return (
    <div className="calendar-container">
      <h2>Calendar To-Do</h2>
      <div className="calendar-grid">
        {Object.keys(tasks).length === 0 ? (
          <p>No tasks available</p>
        ) : (
          Object.keys(tasks).map((date) => (
            <div key={date} className="calendar-day">
              <h3>{date}</h3>
              <ul>
  {tasks[date].map((task) => (
    <li key={task.id}>
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => handleTaskToggle(date, task.id)}
      />
      <span style={task.delay > 0 ? { color: "red" } : {}}>
        {task.process} {task.delay > 0 ? `+${task.delay}` : ""}
      </span>
    </li>
  ))}
</ul>
              <button className="add-task-btn" onClick={() => handleAddTask(date)}>
                + Add Task
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarToDo;
