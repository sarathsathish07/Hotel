import ChatRoom from "../models/chatRoomModel.js";
import Message from "../models/messageModel.js";

const findChatRoomsByUserId = async (userId) => {
  return await ChatRoom.find({ userId }).populate("hotelId", "name");
};

const findChatRoomByUserIdAndHotelId = async (userId, hotelId) => {
  return await ChatRoom.findOne({ userId, hotelId });
};

const createChatRoom = async (chatRoomData) => {
  const chatRoom = new ChatRoom(chatRoomData);
  return await chatRoom.save();
};

const updateChatRoomLastMessage = async (chatRoomId, lastMessageData) => {
  return await ChatRoom.findByIdAndUpdate(chatRoomId, lastMessageData, {
    new: true,
  });
};

const findChatRoomsByHotelIds = async (hotelIds) => {
  return await ChatRoom.find({ hotelId: { $in: hotelIds } });
};

const findChatRoomsByHotelId = async (hotelId) => {
  return await ChatRoom.find({ hotelId }).populate("userId", "name");
};

const countUnreadMessages = async (chatRoomId) => {
  return await Message.countDocuments({
    chatRoomId,
    senderType: "User",
    read: false,
  });
};

const updateChatRoom = async (chatRoomId, updateData) => {
  return await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);
};

export default {
  findChatRoomsByUserId,
  findChatRoomByUserIdAndHotelId,
  createChatRoom,
  updateChatRoomLastMessage,
  findChatRoomsByHotelIds,
  findChatRoomsByHotelId,
  countUnreadMessages,
  updateChatRoom,
};
