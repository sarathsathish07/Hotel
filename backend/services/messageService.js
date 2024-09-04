import messageRepository from "../repositories/messageRepository.js";
import chatRoomRepository from "../repositories/chatRoomRepository.js";
import hotelRepository from "../repositories/hotelRepository.js";

const getMessagesByChatRoomId = async (chatRoomId) => {
  return await messageRepository.findMessagesByChatRoomId(chatRoomId);
};
const sendMessage = async (chatRoomId, messageData) => {
  const newMessage = await messageRepository.createMessage(messageData);

  const lastMessageData = {
    lastMessage: messageData.content,
    lastMessageTime: Date.now(),
  };
  await chatRoomRepository.updateChatRoomLastMessage(
    chatRoomId,
    lastMessageData
  );

  return newMessage;
};
const getUnreadMessages = async (userId) => {
  const chatRooms = await chatRoomRepository.findChatRoomsByUserId(userId);
  const chatRoomIds = chatRooms.map((room) => room._id);

  return await messageRepository.findUnreadMessages(chatRoomIds);
};
const getHotelUnreadMessages = async (hotelierId) => {
  const hotels = await hotelRepository.findHotelsByHotelierId(hotelierId);
  const hotelIds = hotels.map((hotel) => hotel._id);

  const chatRooms = await chatRoomRepository.findChatRoomsByHotelIds(hotelIds);
  const chatRoomIds = chatRooms.map((room) => room._id);

  return await messageRepository.findUnreadMessagesByChatRoomIds(chatRoomIds);
};
const markMessagesAsRead = async (chatRoomId) => {
  return await messageRepository.markMessagesAsRead(chatRoomId);
};
const getHotelMessages = async (chatRoomId) => {
  return await messageRepository.findMessagesByChatRoomId(chatRoomId);
};
const sendHotelMessage = async ({
  chatRoomId,
  content,
  senderType,
  senderId,
  file,
}) => {
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

  return newMessage;
};
const markHotelMessagesAsRead = async (chatRoomId) => {
  return await messageRepository.markMessagesAsReadHotel(chatRoomId);
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
