import asyncHandler from 'express-async-handler';
import RoomService from '../services/roomService.js';

const addRoom = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const hotelierId = req.hotelier._id;
  const { type, price, area, occupancy, noOfRooms, description, amenities } = req.body;

  if (!req.files) {
    return res.status(400).json({
      status: 'error',
      data: null,
      message: 'No images uploaded',
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
      message: 'Room added successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Error adding room',
    });
  }
});


const getRoomById = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await RoomService.getRoomByIdHandler(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: 'Room not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: room,
      message: 'Room retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
};


const getRoomByRoomId = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await RoomService.getRoomByIdHandler(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        data: null,
        message: 'Room not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: room,
      message: 'Room retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: error.message,
    });
  }
};


const getRoomsByHotelIds = async (req, res) => {
  const { hotelIds } = req.body;
  try {
    const rooms = await RoomService.getRoomsByHotelIdsService(hotelIds);
    res.status(200).json({
      status: 'success',
      data: rooms,
      message: 'Rooms retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Server error',
    });
  }
};



const updateRoomHandler = async (req, res) => {
  const { roomId } = req.params;
  const updateData = req.body;

  try {
    const updatedRoom = await RoomService.updateRoomData(roomId, updateData, req.files);
    res.status(200).json({
      status: 'success',
      data: updatedRoom,
      message: 'Room updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      message: 'Error updating room',
    });
  }
};




export { addRoom,
  getRoomById,
  getRoomsByHotelIds,
  updateRoomHandler,
  getRoomByRoomId
 };
