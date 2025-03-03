import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, LogOut, User, X } from "lucide-react";
import "./Header.css";
import arvindLogo from "./assets/arvind.png";

const Header = () => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // ✅ Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notifications");
        if (!response.ok) throw new Error("Failed to fetch notifications");

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // ✅ Dismiss (Delete) Notification
  const dismissNotification = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
      });
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    if (notificationDropdownOpen) setNotificationDropdownOpen(false);
  };

  const toggleNotificationDropdown = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
    if (userDropdownOpen) setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <img src={arvindLogo} alt="Arvind Logo" className="arvind-logo" />

      <div className="header-right">
        <div className="notification-container" ref={notificationDropdownRef}>
          <div onClick={toggleNotificationDropdown}>
            <Bell className="icon notification-icon" />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </div>

          {notificationDropdownOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
              </div>
              {notifications.length > 0 ? (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <div className="notification-content">
                        <p className="notification-text">{notification.message}</p>
                        <span className="notification-time">{notification.timestamp}</span>
                      </div>
                      <button className="notification-dismiss" onClick={() => dismissNotification(notification.id)}>
                        <X className="dismiss-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-notifications">
                  <p>No new notifications</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="user-dropdown" ref={userDropdownRef}>
          <div className="user-info" onClick={toggleUserDropdown}>
            <div className="avatar">
              <User className="avatar-icon" />
            </div>
            <ChevronDown className="dropdown-icon" />
          </div>

          {userDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item profile">
                <User className="dropdown-item-icon" />
                <span>Profile</span>
              </div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                <LogOut className="dropdown-item-icon" />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
