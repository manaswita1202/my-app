import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css"; // Import the CSS file
import { MessageSquareCodeIcon } from "lucide-react";

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! How can I help you?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const chatRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle sending message
    const sendMessage = async () => {
        if (!input.trim()) return;

        // Add user message to chat
        const newMessages = [...messages, { text: input, sender: "user" }];
        setMessages(newMessages);
        setInput("");

        try {
            const response = await fetch("http://127.0.0.1:5000/chatbot/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: input }),
            });

            const data = await response.json();
            setMessages([...newMessages, { text: data.response, sender: "bot" }]);
        } catch (error) {
            setMessages([...newMessages, { text: "Error fetching response.", sender: "bot" }]);
        }
    };

    return (
        <div className="chatbot-container">

            <div ref={chatRef} className="chatbox">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className="chat-input-container">
                <div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="chat-input"
                    placeholder="Ask me something..."
                    onKeyDown={(e) => e.key 
                         === "Enter" && sendMessage()}
                />
                </div>
                <button onClick={sendMessage} className="send-button">
                    <MessageSquareCodeIcon />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
