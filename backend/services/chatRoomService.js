import chatRoomRepository from "../repositories/chatRoomRepository.js";
import messageRepository from "../repositories/messageRepository.js";

const getChatRoomsWithUnreadCount = async (userId) => {
  const chatRooms = await chatRoomRepository.findChatRoomsByUserId(userId);

  const chatRoomsWithUnreadCount = await Promise.all(
    chatRooms.map(async (room) => {
      const unreadMessagesCount = await messageRepository.countUnreadMessages(
        room._id
      );
      return {
        ...room.toObject(),
        unreadMessagesCount,
      };
    })
  );

  return chatRoomsWithUnreadCount;
};
const createOrGetChatRoom = async (userId, hotelId) => {
  let chatRoom = await chatRoomRepository.findChatRoomByUserIdAndHotelId(
    userId,
    hotelId
  );

  if (!chatRoom) {
    chatRoom = await chatRoomRepository.createChatRoom({ userId, hotelId });
  }

  return chatRoom;
};
const getHotelChatRooms = async (hotelId) => {
  const chatRooms = await chatRoomRepository.findChatRoomsByHotelId(hotelId);

  const chatRoomsWithUnreadCount = await Promise.all(
    chatRooms.map(async (room) => {
      const unreadMessagesCount = await chatRoomRepository.countUnreadMessages(
        room._id
      );
      return {
        ...room.toObject(),
        unreadMessagesCount,
      };
    })
  );

  return chatRoomsWithUnreadCount;
};

export default {
  getChatRoomsWithUnreadCount,
  createOrGetChatRoom,
  getHotelChatRooms,
};
