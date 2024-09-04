import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = expressAsyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;
  console.log('Token received:', token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user || user.isBlocked) {
        console.log('User is blocked or not found'); 
        res.clearCookie('jwt', { path: '/' });
        res.status(401).json({ message: 'User is blocked or not authorized' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      console.log('Token verification failed'); 
      res.status(401).json({ message: 'Not authorized, invalid token' });
      return;
    }
  } else {
    console.log('No token provided'); 
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
});

export { protect };
