import { apiSlice } from "./apiSlice";

const HOTELS_URL = "/api/hotels";

export const hotelierApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    hotelierLogin: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),
    hotelierRegister: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    hotelierVerifyOtp: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/verify-otp`,
        method: "POST",
        body: data,
      }),
    }),
    resendHotelierOtp: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/resend-otp`,
        method: "POST",
        body: data,
      }),
    }),
    hotelierLogout: builder.mutation({
      query: () => ({
        url: `${HOTELS_URL}/logout`,
        method: "POST",
      }),
    }),
    getHotelierProfile: builder.query({
      query: () => ({
        url: `${HOTELS_URL}/profile`,
        method: "GET",
      }),
    }),
    hotelierUpdateUser: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
    }),
    uploadHotelCertificate: builder.mutation({
      query: ({ hotelId, formData }) => ({
        url: `${HOTELS_URL}/upload-certificate/${hotelId}`,
        method: "POST",
        body: formData,
      }),
    }),

    addHotel: builder.mutation({
      query: (data) => ({
        url: `${HOTELS_URL}/add-hotel`,
        method: "POST",
        body: data,
      }),
    }),
    getHotels: builder.query({
      query: () => ({
        url: `${HOTELS_URL}/get-hotels`,
        method: "GET",
      }),
    }),
    getHotelByHotelId: builder.query({
      query: (id) => ({
        url: `${HOTELS_URL}/hotels/${id}`,
        method: "GET",
      }),
    }),
    updateHotel: builder.mutation({
      query: ({ id, formData }) => ({
        url: `${HOTELS_URL}/hotels/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),
    addRoom: builder.mutation({
      query: ({ hotelId, formData }) => ({
        url: `${HOTELS_URL}/add-room/${hotelId}`,
        method: "POST",
        body: formData,
      }),
    }),
    getRoomById: builder.query({
      query: (roomId) => `${HOTELS_URL}/rooms/${roomId}`,
    }),
    getHotelierBookings: builder.query({
      query: () => `${HOTELS_URL}/bookings`,
    }),
    updateRoom: builder.mutation({
      query: ({ roomId, formData }) => ({
        url: `${HOTELS_URL}/rooms/${roomId}`,
        method: "PUT",
        body: formData,
      }),
    }),
    getHotelierDashboardStats: builder.query({
      query: () => ({
        url: `${HOTELS_URL}/dashboard`,
        method: "GET",
      }),
    }),
    getHotelierSalesReport: builder.mutation({
      query: ({ from, to }) => ({
        url: `${HOTELS_URL}/salesReport`,
        method: "POST",
        body: { from, to },
      }),
    }),
    getHotelChatRooms: builder.query({
      query: (hotelId) => `${HOTELS_URL}/chatrooms/${hotelId}`,
    }),
    getHotelMessages: builder.query({
      query: (chatRoomId) => `${HOTELS_URL}/chatrooms/${chatRoomId}/messages`,
    }),
    sendHotelMessage: builder.mutation({
      query: (data) => {
        const formData = new FormData();
        formData.append("content", data.content);
        formData.append("senderType", data.senderType);
        formData.append("hotelId", data.hotelId);
        if (data.file) {
          formData.append("file", data.file);
        }

        return {
          url: `${HOTELS_URL}/chatrooms/${data.chatRoomId}/messages`,
          method: "POST",
          body: formData,
        };
      },
    }),
    markHotelMessagesAsRead: builder.mutation({
      query: (chatRoomId) => ({
        url: `${HOTELS_URL}/mark-messages-read`,
        method: "POST",
        body: { chatRoomId },
      }),
    }),
    fetchHotelUnreadMessages: builder.query({
      query: () => ({
        url: `${HOTELS_URL}/unreadHotelmessages`,
        method: "GET",
      }),
    }),
    fetchUnreadHotelierNotifications: builder.query({
      query: () => `${HOTELS_URL}/notifications/unread`,
    }),
    markHotelierNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `${HOTELS_URL}/notifications/${id}/read`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useHotelierLoginMutation,
  useHotelierLogoutMutation,
  useHotelierRegisterMutation,
  useHotelierVerifyOtpMutation,
  useHotelierUpdateUserMutation,
  useUploadHotelCertificateMutation,
  useAddHotelMutation,
  useGetHotelsQuery,
  useGetHotelByHotelIdQuery,
  useUpdateHotelMutation,
  useGetHotelierProfileQuery,
  useResendHotelierOtpMutation,
  useAddRoomMutation,
  useGetRoomByIdQuery,
  useGetHotelierBookingsQuery,
  useUpdateRoomMutation,
  useGetHotelierDashboardStatsQuery,
  useGetHotelierSalesReportMutation,
  useGetHotelChatRoomsQuery,
  useGetHotelMessagesQuery,
  useSendHotelMessageMutation,
  useMarkHotelMessagesAsReadMutation,
  useFetchHotelUnreadMessagesQuery,
  useFetchUnreadHotelierNotificationsQuery,
  useMarkHotelierNotificationAsReadMutation,
} = hotelierApiSlice;
