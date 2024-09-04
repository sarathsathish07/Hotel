import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import {
  useGetHotelChatRoomsQuery,
  useGetHotelMessagesQuery,
  useSendHotelMessageMutation,
  useMarkHotelMessagesAsReadMutation
} from "../../slices/hotelierApiSlice.js";
import HotelierLayout from "../../components/hotelierComponents/HotelierLayout";
import io from "socket.io-client";
import { format } from 'date-fns';
import EmojiPicker from "emoji-picker-react";
import { FaPaperclip } from "react-icons/fa";

const socket = io('https://celebratespaces.site/');

const HotelierChatScreen = () => {
  const { hotelId } = useParams();
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: chatRooms = [], isLoading: isLoadingChatRooms, isError: isErrorChatRooms,refetch: refetchHotelChatRooms, } = useGetHotelChatRoomsQuery(hotelId);
  const { data: messages = [], isLoading: isLoadingMessages, isError: isErrorMessages, refetch: refetchMessages } = useGetHotelMessagesQuery(selectedChatRoom?._id, { skip: !selectedChatRoom });
  const [sendMessage] = useSendHotelMessageMutation();
  const [markMessagesAsRead] = useMarkHotelMessagesAsReadMutation();

  useEffect(() => {
    document.title = "Messages";
    socket.on('message', (message) => {
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
      }
    });

    return () => {
      socket.off('message');
    };
  }, [selectedChatRoom, refetchMessages]);

  useEffect(()=>{
    refetchHotelChatRooms()
  })

  useEffect(() => {
    socket.on("typingUser", () => {
      setIsTyping(true);
    });

    socket.on("stopTypingUser", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("typingUser");
      socket.off("stopTypingUser");
    }
  }, []);

  useEffect(() => {
    if (selectedChatRoom) {
      refetchMessages();
      socket.emit('joinRoom', { roomId: selectedChatRoom._id });

      markMessagesAsRead(selectedChatRoom._id);
      socket.emit("messageRead", { roomId: selectedChatRoom._id });
    }
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

  useEffect(() => {
    socket.on("messageRead", (data) => {
      if (data.roomId === selectedChatRoom?._id) {
        refetchHotelChatRooms();
      }
    });
  
    return () => {
      socket.off("messageRead");
    };
  }, [selectedChatRoom, refetchHotelChatRooms]);

  useEffect(() => {
    socket.on("messageUnRead", () => {
        refetchHotelChatRooms();
      
    });
  
    return () => {
      socket.off("messageUnRead");
    };
  }, [refetchHotelChatRooms]);
  
  

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
        senderType: "Hotel",
        hotelId: hotelId,
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
      socket.emit("messageUnReadHotel", { roomId: selectedChatRoom._id });
      socket.emit("stopTypingHotel", { roomId: selectedChatRoom._id });
    }
  };

  const handleChatRoomSelect = async (room) => {
    setSelectedChatRoom(room);
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

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      socket.emit('typingHotel', { roomId: selectedChatRoom._id });
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        socket.emit('stopTypingHotel', { roomId: selectedChatRoom._id });
      }, 3000);
    }
  };

  let timeout;

  if (isLoadingChatRooms) return <p>Loading...</p>;
  if (isErrorChatRooms) return <div>Error loading chat rooms</div>;

  return (
    <HotelierLayout>
      <Container className="profile-container mx-2" style={{ height: "50vh" }}>
        <Row className="chat-screen">
          <Col md={3} className="chat-sidebar">
            <div className="">
              <h3 className="mb-4">Chats</h3>
              {isLoadingChatRooms ? (
                <p>Loading...</p>
              ) : (
                <ul>
                  {chatRooms.map((room) => (
                    <li
                      key={room._id}
                      className={selectedChatRoom && selectedChatRoom._id === room._id ? "active" : ""}
                      onClick={() => handleChatRoomSelect(room)}
                    >
                      {room.userId.name}
                      {room.unreadMessagesCount > 0 && (
                        <span className="" style={{ marginLeft: "10px", color: "red",fontSize:"30px",borderRadius:"50%" }}>•</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Col>
          <Col md={9} className="">
            <div className="chat-messages">
              {selectedChatRoom ? (
                <>
                  <h5 className="my-3 mx-2">{selectedChatRoom.userId.name}</h5>
                  {isTyping && (
                    <p className="typing-indicator mx-2" style={{ color: "black" }}>Typing...</p>
                  )}
                  <div className="messages" style={{ overflowY: "scroll", height: "450px" }}>
                    {isLoadingMessages ? (
                      <p>Loading messages...</p>
                    ) : (
                      messages
                        .slice()
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                        .map((msg) => (
                          <div
                            key={msg._id}
                            className={`message ${msg.senderType === "User" ? "received" : "sent"}`}
                          >
                            {msg.fileUrl ? (
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
                                        href={`https://celebratespaces.site/${msg.fileUrl}`}
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
                                    src={`https://celebratespaces.site/${msg.fileUrl}`}
                                    alt="file"
                                    style={{ maxWidth: "200px" }}
                                  />
                                )}
                              </div>
                            ) : (
                              msg.content
                            )}

                            <div className="message-time" style={{ fontSize: '9px', marginTop: '5px' }}>
                              {format(new Date(msg.createdAt), ' hh:mm')}
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
                        onChange={handleTyping}
                        onKeyPress={handleTyping}
                        placeholder="Type a message or select a file..."
                        style={{ flex: 1 }}
                        readOnly={!!selectedFile}
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
                        className="emoji-button"
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
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <p style={{marginTop:"30%",marginLeft:"30%"}}>Select a chat to start messaging</p>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </HotelierLayout>
  );
};

export default HotelierChatScreen;
