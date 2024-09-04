import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderType', 
  },
  senderType: {
    type: String,
    required: true,
    enum: ['User', 'Hotel'], 
  },
  content: {
    type: String,
  },
  fileUrl: {
    type: String, 
  },
  fileName: {
    type: String, 
  },
  read: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
