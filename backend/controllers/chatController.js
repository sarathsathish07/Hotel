import expressAsyncHandler from 'express-async-handler';
import ChatRoom from '../models/chatRoomModel.js';
import Message from '../models/messageModel.js';
import Hotel from '../models/hotelModel.js';
import chatRoomService from '../services/chatRoomService.js';
import messageService from '../services/messageService.js';

const getChatRooms = expressAsyncHandler(async (req, res) => {
  try {
    const chatRooms = await chatRoomService.getChatRoomsWithUnreadCount(req.user._id);

    res.status(200).json({
      status: 'success',
      data: chatRooms,
      message: 'Chat rooms retrieved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});


const createChatRoom = expressAsyncHandler(async (req, res) => {
  try {
    const { hotelId } = req.body;
    const chatRoom = await chatRoomService.createOrGetChatRoom(req.user._id, hotelId);

    res.status(201).json({
      status: 'success',
      data: chatRoom,
      message: 'Chat room created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});

const getMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await messageService.getMessagesByChatRoomId(req.params.chatRoomId);

    res.status(200).json({
      status: 'success',
      data: messages,
      message: 'Messages retrieved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
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

    if (senderType === 'User') {
      newMessageData.sender = req.user._id;
    } else if (senderType === 'Hotel') {
      newMessageData.sender = req.hotel._id;
    }

    const newMessage = await messageService.sendMessage(chatRoomId, newMessageData);

    const io = req.app.get('io');
    io.to(chatRoomId).emit('message', newMessage);

    res.status(201).json({
      status: 'success',
      data: newMessage,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});

const getUnreadMessages = expressAsyncHandler(async (req, res) => {
  try {
    const unreadMessages = await messageService.getUnreadMessages(req.user._id);

    res.status(200).json({
      status: 'success',
      data: unreadMessages,
      message: 'Unread messages retrieved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
});


const getHotelUnreadMessages = expressAsyncHandler(async (req, res) => {
  try {
    const unreadMessages = await messageService.getHotelUnreadMessages(req.hotelier._id);

    res.status(200).json({
      status: 'success',
      data: unreadMessages,
      message: 'Unread messages retrieved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});

const markMessagesAsRead = expressAsyncHandler(async (req, res) => {
  try {
    const { chatRoomId } = req.body;

    await messageService.markMessagesAsRead(chatRoomId);

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});


const getHotelChatRooms = expressAsyncHandler(async (req, res) => {
  try {
    const chatRoomsWithUnreadCount = await chatRoomService.getHotelChatRooms(req.params.hotelId);

    res.status(200).json({
      status: 'success',
      data: chatRoomsWithUnreadCount,
      message: 'Chat rooms retrieved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});



const getHotelMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await messageService.getHotelMessages(req.params.chatRoomId);

    res.status(200).json({
      status: 'success',
      data: messages,
      message: 'Messages retrieved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});


const sendHotelMessages = expressAsyncHandler(async (req, res) => {
  try {
    const chatRoomId = req.params.chatRoomId;
    const { content, senderType, hotelId } = req.body;
    const file = req.file;

    const senderId = senderType === 'User' ? req.user._id : hotelId;

    const newMessage = await messageService.sendHotelMessage({
      chatRoomId,
      content,
      senderType,
      senderId,
      file,
    });

    const io = req.app.get('io');
    io.to(chatRoomId).emit('message', newMessage);

    res.status(201).json({
      status: 'success',
      data: newMessage,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});


const markHotelMessagesAsRead = expressAsyncHandler(async (req, res) => {
  try {
    const { chatRoomId } = req.body;

    await messageService.markHotelMessagesAsRead(chatRoomId);

    res.status(200).json({
      status: 'success',
      data: null,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server Error',
    });
  }
});



export { getChatRooms, createChatRoom, getMessages, sendMessage,getHotelMessages,sendHotelMessages,getHotelChatRooms,getUnreadMessages,markMessagesAsRead,
  markHotelMessagesAsRead,getHotelUnreadMessages
 };
