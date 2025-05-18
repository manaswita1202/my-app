import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css"; // Import the CSS file
import { MessageSquareCodeIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! How can I help you?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);

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
        } finally {
            setIsLoading(false);
        }
    };

    // Custom renderer components for markdown
    const components = {
        // Simple code block rendering without syntax highlighting
        code({ node, inline, className, children, ...props }) {
            return inline ? (
                <code className="inline-code" {...props}>
                    {children}
                </code>
            ) : (
                <pre className="code-block">
                    <code {...props}>{children}</code>
                </pre>
            );
        },
        // Custom table wrapper for scrolling
        table({ node, ...props }) {
            return (
                <div className="table-container">
                    <table {...props} />
                </div>
            );
        }
    };

    return (
        <div className="chatbot-container">
            <div ref={chatRef} className="chatbox">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.sender === "bot" ? (
                            <div className="markdown-content">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]} 
                                    components={components}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            msg.text
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="message bot">
                        <div className="loading-indicator">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="chat-input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="chat-input"
                    placeholder="Ask me something..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                />
                <button 
                    onClick={sendMessage} 
                    className="send-button"
                    disabled={isLoading}
                >
                    <MessageSquareCodeIcon size={16} />
                </button>
            </div>
        </div>
    );
};;

export default Chatbot;