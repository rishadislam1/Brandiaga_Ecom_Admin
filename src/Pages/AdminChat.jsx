import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";

const AdminChat = () => {
    const [messages, setMessages] = useState({});
    const [newMessage, setNewMessage] = useState("");
    const [connection, setConnection] = useState(null);
    const [adminId, setAdminId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [users, setUsers] = useState([]);
    const scrollAreaRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setAdminId(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub);
        }

        const newConnection = new HubConnectionBuilder()
            .withUrl("http://localhost:5147/livechatHub", {
                accessTokenFactory: () => token || "",
            })
            .withAutomaticReconnect()
            .build();

        newConnection.on("ReceiveMessage", (message, senderId) => {
            console.log("Received message from", senderId, ":", message);
            setMessages((prev) => ({
                ...prev,
                [senderId]: [...(prev[senderId] || []), { id: Date.now().toString(), text: message, sender: "user", senderId }],
            }));
        });

        newConnection.on("Connected", (connectionId) => {
            console.log("Admin connected with ID:", connectionId);
        });

        newConnection.on("UserDisconnected", (connectionId) => {
            console.log("User disconnected:", connectionId);
        });

        newConnection.onclose((error) => {
            console.error("Connection closed:", error);
        });

        newConnection
            .start()
            .then(() => console.log("SignalR connected with AdminId:", adminId))
            .catch((err) => console.error("SignalR connection failed:", err));

        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:5147/api/livechat/users`, {
                    headers: { Authorization: `Bearer ${token}`}});
                setUsers(response.data.data.map(u => u.userId));
                if (response.data.data.length > 0) setSelectedUserId(response.data.data[0].userId);
            } catch (err) {
                    console.error("Failed to fetch users:", err);
                }
            };
            fetchUsers();

            const fetchMessages = async () => {
                if (adminId) {
                    try {
                        const response = await axios.get(`http://localhost:5147/api/livechat/admin/${adminId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const messagesByUser = response.data.data.reduce((acc, m) => {
                            acc[m.userId] = [...(acc[m.userId] || []), { id: m.messageId, text: m.message, sender: m.userId ? "user" : "admin", senderId: m.userId || adminId }];
                            return acc;
                        }, {});
                        setMessages(messagesByUser);
                    } catch (err) {
                        console.error("Failed to fetch messages:", err);
                    }
                }
            };
            fetchMessages();

            setConnection(newConnection);

            return () => {
                newConnection.stop();
            };
        }, [adminId]);

        useEffect(() => {
            if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
            }
        }, [messages, selectedUserId]);

        const handleSendMessage = async () => {
            if (!newMessage.trim() || !connection || !adminId || !selectedUserId) return;
            try {
                await connection.invoke("SendMessageToUser", selectedUserId, newMessage);
                setMessages((prev) => ({
                    ...prev,
                    [selectedUserId]: [...(prev[selectedUserId] || []), { id: Date.now().toString(), text: newMessage, sender: "admin", senderId: adminId }],
                }));
                setNewMessage("");
            } catch (error) {
                console.error("Failed to send message:", error.message);
                if (error.message.includes("No connected client")) {
                    alert("User is currently offline. Try again later.");
                }
            }
        };

        const userMessages = selectedUserId ? messages[selectedUserId] || [] : [];

        return (
            <Box sx={{ p: 3, height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" gutterBottom>
                    Live Chat
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Select User</InputLabel>
                        <Select
                            value={selectedUserId || ""}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            label="Select User"
                        >
                            {users.map((userId) => (
                                <MenuItem key={userId} value={userId}>
                                    {userId}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box ref={scrollAreaRef} sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
                    <List>
                        {userMessages.map((message) => (
                            <ListItem key={message.id}>
                                <ListItemText
                                    primary={message.text}
                                    secondary={`${message.sender === "admin" ? "Admin" : "User"}: ${message.senderId}`}
                                    sx={{ backgroundColor: message.sender === "admin" ? "#e0f7fa" : "#fff3e0", p: 1, borderRadius: 1 }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        fullWidth
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        variant="outlined"
                    />
                    <Button variant="contained" onClick={handleSendMessage} sx={{ minWidth: 100 }}>
                        Send
                    </Button>
                </Box>
            </Box>
        );
    };

    export default AdminChat;