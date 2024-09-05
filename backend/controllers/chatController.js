import expressAsyncHandler from "express-async-handler";
import chatRoomService from "../services/chatRoomService.js";
import messageService from "../services/messageService.js";
import responseMessages from "../constants/responseMessages.js";

const getChatRooms = expressAsyncHandler(async (req, res) => {
  try {
    const chatRooms = await chatRoomService.getChatRoomsWithUnreadCount(
      req.user._id
    );

    res.status(200).json({
      status: "success",
      data: chatRooms,
      message: responseMessages.CHAT_ROOMS_RETRIEVED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const createChatRoom = expressAsyncHandler(async (req, res) => {
  try {
    const { hotelId } = req.body;
    const chatRoom = await chatRoomService.createOrGetChatRoom(
      req.user._id,
      hotelId
    );

    res.status(201).json({
      status: "success",
      data: chatRoom,
      message: responseMessages.CHAT_ROOM_CREATED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const getMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await messageService.getMessagesByChatRoomId(
      req.params.chatRoomId
    );

    res.status(200).json({
      status: "success",
      data: messages,
      message: responseMessages.MESSAGES_RETRIEVED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const sendMessage = expressAsyncHandler(async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const { content, senderType } = req.body;
    const file = req.file;

    const newMessageData = {
      chatRoomId,
      createdAt: Date.now(),
      content,
      senderType,
    };

    if (file) {
      newMessageData.fileUrl = `/MessageFiles/${file.filename}`;
      newMessageData.fileName = file.originalname;
    }

    if (senderType === "User") {
      newMessageData.sender = req.user._id;
    } else if (senderType === "Hotel") {
      newMessageData.sender = req.hotel._id;
    }

    const newMessage = await messageService.sendMessage(
      chatRoomId,
      newMessageData
    );

    const io = req.app.get("io");
    io.to(chatRoomId).emit("message", newMessage);

    res.status(201).json({
      status: "success",
      data: newMessage,
      message: responseMessages.MESSAGE_SENT_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const getUnreadMessages = expressAsyncHandler(async (req, res) => {
  try {
    const unreadMessages = await messageService.getUnreadMessages(req.user._id);

    res.status(200).json({
      status: "success",
      data: unreadMessages,
      message: responseMessages.UNREAD_MESSAGES_RETRIEVED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const getHotelUnreadMessages = expressAsyncHandler(async (req, res) => {
  try {
    const unreadMessages = await messageService.getHotelUnreadMessages(
      req.hotelier._id
    );

    res.status(200).json({
      status: "success",
      data: unreadMessages,
      message: responseMessages.UNREAD_MESSAGES_RETRIEVED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const markMessagesAsRead = expressAsyncHandler(async (req, res) => {
  try {
    const { chatRoomId } = req.body;

    await messageService.markMessagesAsRead(chatRoomId);

    res.status(200).json({
      status: "success",
      data: null,
      message: responseMessages.MESSAGES_MARKED_AS_READ,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const getHotelChatRooms = expressAsyncHandler(async (req, res) => {
  try {
    const chatRoomsWithUnreadCount = await chatRoomService.getHotelChatRooms(
      req.params.hotelId
    );

    res.status(200).json({
      status: "success",
      data: chatRoomsWithUnreadCount,
      message: responseMessages.CHAT_ROOMS_RETRIEVED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const getHotelMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await messageService.getHotelMessages(
      req.params.chatRoomId
    );

    res.status(200).json({
      status: "success",
      data: messages,
      message: responseMessages.MESSAGES_RETRIEVED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const sendHotelMessages = expressAsyncHandler(async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const { content, senderType, hotelId } = req.body;
    const file = req.file;

    const senderId = senderType === "User" ? req.user._id : hotelId;

    const newMessage = await messageService.sendHotelMessage({
      chatRoomId,
      content,
      senderType,
      senderId,
      file,
    });

    const io = req.app.get("io");
    io.to(chatRoomId).emit("message", newMessage);

    res.status(201).json({
      status: "success",
      data: newMessage,
      message: responseMessages.MESSAGE_SENT_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

const markHotelMessagesAsRead = expressAsyncHandler(async (req, res) => {
  try {
    const { chatRoomId } = req.body;

    await messageService.markHotelMessagesAsRead(chatRoomId);

    res.status(200).json({
      status: "success",
      data: null,
      message: responseMessages.MESSAGES_MARKED_AS_READ,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      data: null,
      message: responseMessages.SERVER_ERROR,
    });
  }
});

export {
  getChatRooms,
  createChatRoom,
  getMessages,
  sendMessage,
  getHotelMessages,
  sendHotelMessages,
  getHotelChatRooms,
  getUnreadMessages,
  markMessagesAsRead,
  markHotelMessagesAsRead,
  getHotelUnreadMessages,
};
