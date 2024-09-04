import notificationRepository from "../repositories/notificationRepository.js";
import responseMessages from "../constants/responseMessages.js";

const getUnreadNotifications = async (userId) => {
  return await notificationRepository.findUnreadNotificationsByUserId(userId);
};

const markNotificationAsRead = async (id, userId) => {
  const notification = await notificationRepository.findNotificationById(id);

  if (!notification) {
    throw new Error(responseMessages.NOTIFICATION_NOT_FOUND);
  }

  if (notification.userId.toString() !== userId.toString()) {
    throw new Error(responseMessages.NOT_AUTHORIZED);
  }

  notification.isRead = true;
  return await notificationRepository.updateNotificationStatus(notification);
};

const getUnreadHotelierNotifications = async (hotelierId) => {
  return notificationRepository.getUnreadNotifications(hotelierId);
};

const markHotelierNotificationAsRead = async (id, hotelierId) => {
  const notification = await notificationRepository.findNotificationById(id);

  if (!notification) {
    throw new Error(responseMessages.NOTIFICATION_NOT_FOUND);
  }

  if (notification.hotelierId.toString() !== hotelierId.toString()) {
    throw new Error(responseMessages.NOT_AUTHORIZED_HOTELIER);
  }

  return notificationRepository.updateNotificationAsRead(notification);
};

export default {
  getUnreadNotifications,
  markNotificationAsRead,
  getUnreadHotelierNotifications,
  markHotelierNotificationAsRead,
};
