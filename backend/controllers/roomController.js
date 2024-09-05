import asyncHandler from 'express-async-handler';
import RoomService from '../services/roomService.js';
import responseMessages from '../constants/responseMessages.js';

const addRoom = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const hotelierId = req.hotelier._id;
  const { type, price, area, occupancy, noOfRooms, description, amenities } = req.body;

  if (!req.files) {
    return res.status(400).json({
      status: 'error',
      data: null,
      message: responseMessages.noImagesUploaded,
    });
  }

  const images = req.files.map((file) => {
    return file.path.replace(/.*public[\\/]/, ""); 
  });

  const roomData = {
    type,
    price,
    area,
    occupancy,
    noOfRooms,
    description,
    amenities: amenities.split(",").map((amenity) => amenity.trim()),
    images,
  };

  try {
    const createdRoom = await RoomService.addRoomHandler(hotelId, hotelierId, roomData);
    res.status(201).json({
      status: 'success',
      data: createdRoom,
      message: responseMessages.roomAdded,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.errorAddingRoom,
    });
  }
});

const getRoomById = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await RoomService.getRoomByIdHandler(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: responseMessages.roomNotFound,
      });
    }
    res.status(200).json({
      status: 'success',
      data: room,
      message: responseMessages.roomRetrieved,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const getRoomByRoomId = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await RoomService.getRoomByIdHandler(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: responseMessages.roomNotFound,
      });
    }
    res.status(200).json({
      status: 'success',
      data: room,
      message: responseMessages.roomRetrieved,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
});

const getRoomsByHotelIds = asyncHandler(async (req, res) => {
  const { hotelIds } = req.body;
  try {
    const rooms = await RoomService.getRoomsByHotelIdsService(hotelIds);
    res.status(200).json({
      status: 'success',
      data: rooms,
      message: responseMessages.roomsRetrieved,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.serverError,
    });
  }
});

const updateRoomHandler = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const updateData = req.body;

  try {
    const updatedRoom = await RoomService.updateRoomData(roomId, updateData, req.files);
    res.status(200).json({
      status: 'success',
      data: updatedRoom,
      message: responseMessages.roomUpdated,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: responseMessages.errorUpdatingRoom,
    });
  }
});

export {
  addRoom,
  getRoomById,
  getRoomsByHotelIds,
  updateRoomHandler,
  getRoomByRoomId
};
