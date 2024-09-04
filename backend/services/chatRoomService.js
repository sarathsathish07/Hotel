import chatRoomRepository from "../repositories/chatRoomRepository.js";
import messageRepository from "../repositories/messageRepository.js";
import responseMessages from "../constants/responseMessages.js";

const getChatRoomsWithUnreadCount = async (userId) => {
  try {
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
  } catch (error) {
    throw new Error(responseMessages.ERROR);
  }
};

const createOrGetChatRoom = async (userId, hotelId) => {
  try {
    let chatRoom = await chatRoomRepository.findChatRoomByUserIdAndHotelId(
      userId,
      hotelId
    );

    if (!chatRoom) {
      chatRoom = await chatRoomRepository.createChatRoom({ userId, hotelId });
      return { chatRoom, message: responseMessages.CHAT_ROOM_CREATED_SUCCESS };
    }

    return { chatRoom };
  } catch (error) {
    throw new Error(responseMessages.ERROR);
  }
};

const getHotelChatRooms = async (hotelId) => {
  try {
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
  } catch (error) {
    throw new Error(responseMessages.ERROR);
  }
};

export default {
  getChatRoomsWithUnreadCount,
  createOrGetChatRoom,
  getHotelChatRooms,
};
