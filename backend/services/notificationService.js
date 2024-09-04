import notificationRepository from "../repositories/notificationRepository.js";

const getUnreadNotifications = async (userId) => {
  return await notificationRepository.findUnreadNotificationsByUserId(userId);
};
const markNotificationAsRead = async (id, userId) => {
  const notification = await notificationRepository.findNotificationById(id);

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.userId.toString() !== userId.toString()) {
    throw new Error("Not authorized to mark this notification as read");
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
    throw new Error("Notification not found");
  }

  if (notification.hotelierId.toString() !== hotelierId.toString()) {
    throw new Error("Not authorized");
  }

  return notificationRepository.updateNotificationAsRead(notification);
};

export default {
  getUnreadNotifications,
  markNotificationAsRead,
  getUnreadHotelierNotifications,
  markHotelierNotificationAsRead,
};
