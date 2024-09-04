import messageRepository from "../repositories/messageRepository.js";
import chatRoomRepository from "../repositories/chatRoomRepository.js";
import hotelRepository from "../repositories/hotelRepository.js";
import responseMessages from "../constants/responseMessages.js";

const getMessagesByChatRoomId = async (chatRoomId) => {
  try {
    const messages = await messageRepository.findMessagesByChatRoomId(chatRoomId);
    return {
      status: "success",
      data: messages,
      message: responseMessages.GET_MESSAGES_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: responseMessages.GET_MESSAGES_ERROR };
  }
};

const sendMessage = async (chatRoomId, messageData) => {
  try {
    const newMessage = await messageRepository.createMessage(messageData);

    const lastMessageData = {
      lastMessage: messageData.content,
      lastMessageTime: Date.now(),
    };
    await chatRoomRepository.updateChatRoomLastMessage(
      chatRoomId,
      lastMessageData
    );

    return {
      status: "success",
      data: newMessage,
      message: responseMessages.SEND_MESSAGE_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: responseMessages.SEND_MESSAGE_ERROR };
  }
};

const getUnreadMessages = async (userId) => {
  try {
    const chatRooms = await chatRoomRepository.findChatRoomsByUserId(userId);
    const chatRoomIds = chatRooms.map((room) => room._id);

    const unreadMessages = await messageRepository.findUnreadMessages(chatRoomIds);
    return {
      status: "success",
      data: unreadMessages,
      message: responseMessages.GET_UNREAD_MESSAGES_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: responseMessages.GET_UNREAD_MESSAGES_ERROR };
  }
};

const getHotelUnreadMessages = async (hotelierId) => {
  try {
    const hotels = await hotelRepository.findHotelsByHotelierId(hotelierId);
    const hotelIds = hotels.map((hotel) => hotel._id);

    const chatRooms = await chatRoomRepository.findChatRoomsByHotelIds(hotelIds);
    const chatRoomIds = chatRooms.map((room) => room._id);

    const unreadMessages = await messageRepository.findUnreadMessagesByChatRoomIds(chatRoomIds);
    return {
      status: "success",
      data: unreadMessages,
      message: responseMessages.GET_HOTEL_UNREAD_MESSAGES_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: responseMessages.GET_HOTEL_UNREAD_MESSAGES_ERROR };
  }
};

const markMessagesAsRead = async (chatRoomId) => {
  try {
    await messageRepository.markMessagesAsRead(chatRoomId);
    return { status: "success", data: null, message: responseMessages.MARK_MESSAGES_AS_READ_SUCCESS };
  } catch (error) {
    return { status: "error", data: null, message: responseMessages.MARK_MESSAGES_AS_READ_ERROR };
  }
};

const getHotelMessages = async (chatRoomId) => {
  try {
    const messages = await messageRepository.findMessagesByChatRoomId(chatRoomId);
    return {
      status: "success",
      data: messages,
      message: responseMessages.GET_HOTEL_MESSAGES_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: responseMessages.GET_HOTEL_MESSAGES_ERROR };
  }
};

const sendHotelMessage = async ({
  chatRoomId,
  content,
  senderType,
  senderId,
  file,
}) => {
  try {
    const newMessageData = {
      chatRoomId,
      createdAt: Date.now(),
    };

    if (file) {
      newMessageData.fileUrl = `/MessageFiles/${file.filename}`;
      newMessageData.fileName = file.originalname;
    }

    if (content) {
      newMessageData.content = content;
    }

    newMessageData.sender = senderId;
    newMessageData.senderType = senderType;

    const newMessage = await messageRepository.createMessage(newMessageData);

    await chatRoomRepository.updateChatRoom(chatRoomId, {
      lastMessage: content,
      lastMessageTime: Date.now(),
    });

    return {
      status: "success",
      data: newMessage,
      message: responseMessages.SEND_HOTEL_MESSAGE_SUCCESS,
    };
  } catch (error) {
    return { status: "error", data: null, message: responseMessages.SEND_HOTEL_MESSAGE_ERROR };
  }
};

const markHotelMessagesAsRead = async (chatRoomId) => {
  try {
    await messageRepository.markMessagesAsReadHotel(chatRoomId);
    return { status: "success", data: null, message: responseMessages.MARK_HOTEL_MESSAGES_AS_READ_SUCCESS };
  } catch (error) {
    return { status: "error", data: null, message: responseMessages.MARK_HOTEL_MESSAGES_AS_READ_ERROR };
  }
};

export default {
  getMessagesByChatRoomId,
  sendMessage,
  getUnreadMessages,
  getHotelUnreadMessages,
  markMessagesAsRead,
  getHotelMessages,
  sendHotelMessage,
  markHotelMessagesAsRead,
};
