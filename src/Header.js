import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, LogOut, User, X, MessageCircle, UserPlus } from "lucide-react";
import "./Header.css";
import samplifylogo from "./assets/samplifylogo.png";
import Chatbot from "./Chatbot"; // Assuming you have a ChatBot component

const Header = () => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [chatBotOpen, setChatBotOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const chatBotRef = useRef(null);

  // Check if user is admin
  useEffect(() => {
    const roleName = localStorage.getItem("role_name");
    setIsAdmin(roleName === "admin");
  }, []);

  // ✅ Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("https://samplify-backend-production.up.railway.app/api/notifications");
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
      await fetch(`https://samplify-backend-production.up.railway.app/api/notifications/${id}`, {
        method: "DELETE",
      });
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // ✅ Clear All Notifications
  const clearAllNotifications = async () => {
    try {
      await fetch(`https://samplify-backend-production.up.railway.app/api/notifications/clear-all`, {
        method: "DELETE",
      });
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    if (notificationDropdownOpen) setNotificationDropdownOpen(false);
    if (chatBotOpen) setChatBotOpen(false);
  };

  const toggleNotificationDropdown = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
    if (userDropdownOpen) setUserDropdownOpen(false);
    if (chatBotOpen) setChatBotOpen(false);
  };

  const toggleChatBot = () => {
    setChatBotOpen(!chatBotOpen);
    if (userDropdownOpen) setUserDropdownOpen(false);
    if (notificationDropdownOpen) setNotificationDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role_name");
    window.location.href = "/login"; // Redirect to login  
    console.log("Logging out...");
  };

  const handleInvite = () => {
    window.location.href = "/dashboard/invite"; // Redirect to invite page
    setUserDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
      if (chatBotRef.current && !chatBotRef.current.contains(event.target)) {
        setChatBotOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <img src={samplifylogo} alt="Samplify Logo" className="arvind-logo" />

      <div className="header-right">
        {/* ChatBot Container */}
        <div className="chatbot-container" ref={chatBotRef}>
          <div onClick={toggleChatBot}>
            <MessageCircle className="icon chatbot-icon" />
          </div>

          {chatBotOpen && (
            <div className="chatbot-dropdown">
              <div className="chatbot-header">
                <h3>AI Assistant</h3>
                {/* <button className="chatbot-close" onClick={() => setChatBotOpen(false)}>
                  <X className="close-icon" />
                </button> */}
              </div>
              <div className="chatbot-content">
                <Chatbot />
              </div>
            </div>
          )}
        </div>

        {/* Notification Container */}
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
                  <button className="clear-all-btn" onClick={() => clearAllNotifications()}>
                    Clear All
                  </button>
                </div>
              ) : (
                <div className="empty-notifications">
                  <p>No new notifications</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Dropdown */}
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
              {isAdmin && (
                <div className="dropdown-item invite" onClick={handleInvite}>
                  <UserPlus className="dropdown-item-icon" />
                  <span>Invite</span>
                </div>
              )}
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