
import Message from "../models/messageModel.js";

const countUnreadMessages = async (chatRoomId) => {
  return await Message.countDocuments({
    chatRoomId,
    senderType: 'Hotel',
    read: false,
  });
};
const findMessagesByChatRoomId = async (chatRoomId) => {
  return await Message.find({ chatRoomId }).sort('timestamp');
};
const createMessage = async (messageData) => {
  return await Message.create(messageData);
};

const findUnreadMessages = async (chatRoomIds) => {
  return await Message.find({
    chatRoomId: { $in: chatRoomIds },
    senderType: 'Hotel',
    read: false,
  });
};

const findUnreadMessagesByChatRoomIds = async (chatRoomIds) => {
  return await Message.find({
    chatRoomId: { $in: chatRoomIds },
    senderType: 'User',
    read: false,
  });
};
const markMessagesAsRead = async (chatRoomId) => {
  return await Message.updateMany(
    { chatRoomId, senderType: { $ne: 'User' }, read: false },
    { $set: { read: true } }
  );
};
const markMessagesAsReadHotel = async (chatRoomId) => {
  return await Message.updateMany(
    { chatRoomId, senderType: { $ne: 'Hotel' }, read: false },
    { $set: { read: true } }
  );
};


export default { countUnreadMessages,findMessagesByChatRoomId,createMessage,findUnreadMessages,findUnreadMessagesByChatRoomIds,markMessagesAsRead,
  markMessagesAsReadHotel
 };
