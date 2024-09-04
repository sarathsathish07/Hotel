import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  useGetChatRoomsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCreateChatRoomMutation,
  useMarkMessagesAsReadMutation,
} from "../../slices/usersApiSlice.js";
import io from "socket.io-client";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../../components/userComponents/Sidebar.jsx";
import { useSelector } from "react-redux";
import EmojiPicker from "emoji-picker-react";
import { FaPaperclip } from "react-icons/fa";
import { format } from 'date-fns';

const socket = io("https://celebratespaces.site/");

const ChatScreen = () => {
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();
  const currentHotelId = location.pathname.split("/")[2];
  const messagesEndRef = useRef(null);

  const {
    data: chatRooms = [],
    refetch: refetchChatRooms,
    error: chatRoomsError,
    isLoading: chatRoomsLoading,
  } = useGetChatRoomsQuery();
  const {
    data: messages = [],
    refetch: refetchMessages,
    error: messagesError,
    isLoading: messagesLoading,
  } = useGetMessagesQuery(selectedChatRoom?._id, { skip: !selectedChatRoom });

  const [sendMessage] = useSendMessageMutation();
  const [createChatRoom] = useCreateChatRoomMutation();
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = "Messages - Celebrate Spaces";
    if (selectedChatRoom) {
      refetchMessages();
      socket.emit("joinRoom", { roomId: selectedChatRoom._id });
      markMessagesAsRead(selectedChatRoom._id); 
      socket.emit("messageRead", { roomId: selectedChatRoom._id });
    }
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

  useEffect(() => {
    socket.on("message", (message) => {
      
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
      } 
    });

    return () => {
      socket.off("message");
    };
  }, [selectedChatRoom, refetchMessages]);

  useEffect(() => {
    socket.on("messageRead", (data) => {
      if (data.roomId === selectedChatRoom?._id) {
        
        refetchChatRooms();
      }
    });
  
    return () => {
      socket.off("messageRead");
    };
  }, [selectedChatRoom, refetchChatRooms]);

  useEffect(() => {
    socket.on("messageUnReadHotel", () => {
        refetchChatRooms();
      
    });
  
    return () => {
      socket.off("messageUnReadHotel");
    };
  }, [refetchChatRooms]);
  
  useEffect(()=>{
    refetchChatRooms()
  })

  useEffect(() => {
    socket.on("typingHotel", () => {
      setIsTyping(true);
    });

    socket.on("stopTypingHotel", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("typingHotel");
      socket.off("stopTypingHotel");
    };
  }, []);

  useEffect(() => {
    if (chatRoomsError) {
      console.error("Failed to fetch chat rooms:", chatRoomsError);
    }
    if (messagesError) {
      console.error("Failed to fetch messages:", messagesError);
    }
  }, [chatRoomsError, messagesError]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() || selectedFile) {
      const messageData = {
        chatRoomId: selectedChatRoom._id,
        content: newMessage,
        senderType: "User",
      };
  
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        messageData.content = selectedFile.name;
        messageData.file = selectedFile;
      }
  
      await sendMessage(messageData);
      setNewMessage("");
      setSelectedFile(null);
      setSelectedFileName(""); 
      refetchMessages();
      socket.emit("message", messageData);
      socket.emit("messageUnRead", { roomId: selectedChatRoom._id });
      socket.emit("stopTypingUser", { roomId: selectedChatRoom._id });
    }
  };

  const handleChatRoomSelect = async (hotelId) => {
    let chatRoom = chatRooms.find((room) => room.hotelId._id === hotelId);
    if (!chatRoom) {
      chatRoom = await createChatRoom({ hotelId }).unwrap();
      refetchChatRooms();
    }
    setSelectedChatRoom(chatRoom);
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };

  const handleTyping = () => {
    socket.emit("typingUser", { roomId: selectedChatRoom._id });

    clearTimeout(timeout);
    timeout = setTimeout(stopTyping, 1000);
  };

  const stopTyping = () => {
    socket.emit("stopTypingUser", { roomId: selectedChatRoom._id });
  };

  let timeout;

  return (
    <Container className="profile-container" style={{ height: "50vh" }}>
      <Row>
        <Col md={3} className="sidebar-container">
          <Sidebar profileImage={userInfo?.profileImage} name={userInfo?.name} />
        </Col>
        <Col md={9}>
          <div className="chat-screen">
            <div className="chat-sidebar">
              <h3 className="mb-4">Chats</h3>
              {chatRoomsLoading ? (
                <p>Loading...</p>
              ) : (
                <ul>
                  {chatRooms.map((room) => (
                    <li
                      key={room?.hotelId?._id}
                      className={currentHotelId === room?.hotelId?._id ? "active" : ""}
                      onClick={() => handleChatRoomSelect(room?.hotelId?._id)}
                    >
                      {room?.hotelId?.name}
                      {room?.unreadMessagesCount > 0 && <span style={{ marginLeft: "10px", color: "red",fontSize:"30px",borderRadius:"50%" }}>•</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="chat-messages">
              {selectedChatRoom ? (
                <>
                  <h5 className="my-3 mx-2">{selectedChatRoom?.hotelId?.name}</h5>
                  {isTyping && (
                    <p className="typing-indicator mx-2" style={{ color: "black" }}>Typing...</p>
                  )}
                  <div className="messages">
                    {messagesLoading ? (
                      <p>Loading messages...</p>
                    ) : (
                      messages
                        .slice()
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                        .map((msg) => (
                          <div
                            key={msg._id}
                            className={`message ${msg.senderType === "User" ? "sent" : "received"}`}
                          >
                            {msg?.fileUrl ? (
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                {msg.fileUrl.endsWith('.pdf') ||  
                                    msg.fileUrl.endsWith('.doc') ||
                                    msg.fileUrl.endsWith('.docx') ||
                                    msg.fileUrl.endsWith('.xls') ||
                                    msg.fileUrl.endsWith('.xlsx') ||
                                    msg.fileUrl.endsWith('.txt') ? (
                                      <div style={{ display: "flex", flexDirection: "column" }}>
                                      <div>{msg.content}</div>
                                      <a
                                        href={`https://celebratespaces.site${msg?.fileUrl?.startsWith('/') ? msg?.fileUrl : `/${msg?.fileUrl}`}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        style={{ marginTop: "5px" }}
                                      >
                                        Download
                                      </a>
                                    </div>
                                    
                                ) : (
                                  <img
                                    src={`https://celebratespaces.site/${msg?.fileUrl}`}
                                    alt="file"
                                    style={{ maxWidth: "200px" }}
                                  />
                                )}
                              </div>
                            ) : (
                              msg?.content
                            )}

                            <div className="message-time" style={{ fontSize: '9px', marginTop: '5px' }}>
                              {format(new Date(msg?.createdAt), ' hh:mm')}
                            </div>
                          </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div
                    className="new-message my-2"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      position: "relative",
                    }}
                  >
                    <div className="input-group mx-2">
                      <input
                        type="text"
                        value={selectedFileName || newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleTyping}
                        placeholder="Type a message..."
                        style={{ flex: 1 }}
                        readOnly={selectedFile}
                      />
                      <button
                        onClick={handleSendMessage}
                        style={{ backgroundColor: "#555555", padding: "10px", borderRadius: "10px", width: "70px" }}
                      >
                        Send
                      </button>
                      <div>
                        {showEmojiPicker && (
                          <div style={{ position: "absolute", bottom: "50px",right:"20px" }}>
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                          </div>
                        )}
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          style={{ marginLeft: "10px", border: "1px solid black", padding: "10px", borderRadius: "10px" }}
                        >
                          😊
                        </button>
                      </div>
                      <label htmlFor="file-upload" style={{ marginLeft: "10px", border: "1px solid black", padding: "5px", borderRadius: "10px", width: "50px", textAlign: "center", cursor: "pointer" }}>
                        <FaPaperclip style={{ color: "#555555", cursor: "pointer" }} />
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />

                    </div>
                  </div>
                </>
              ) : (
                
                  <p style={{marginTop:"30%",marginLeft:"30%"}} >Please select a chat room to start messaging.</p>
           
                
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatScreen;
