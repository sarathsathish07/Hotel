import { Server } from 'socket.io';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "https://celebrate-spaces.vercel.app","https://celebrate-spaces-kqbj.vercel.app"],
      methods: ["GET", "POST"],
      credentials: true 
    },
  });
  

  io.on('connection', (socket) => {

    socket.on('joinRoom', ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on('disconnect', () => {
    });
    socket.on('messageRead', ({ roomId }) => {
      io.to(roomId).emit('messageRead', { roomId });
    });
    socket.on('messageUnRead', ({ roomId }) => {
      io.to(roomId).emit('messageUnRead', { roomId });
    });
    socket.on('messageUnReadHotel', ({ roomId }) => {
      io.to(roomId).emit('messageUnReadHotel', { roomId });
    });

    socket.on('typingUser', ({ roomId }) => {
      socket.to(roomId).emit('typingUser');
    });

    socket.on('stopTypingUser', ({ roomId }) => {
      socket.to(roomId).emit('stopTypingUser');
    });

    socket.on('typingHotel', ({ roomId }) => {
      socket.to(roomId).emit('typingHotel');
    });

    socket.on('stopTypingHotel', ({ roomId }) => {
      socket.to(roomId).emit('stopTypingHotel');
    });
  });

  return io;
};

export default configureSocket;
