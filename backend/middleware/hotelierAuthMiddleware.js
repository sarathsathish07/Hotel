import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import Hotelier from "../models/hotelierModel.js";

const protect = expressAsyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwtHotelier;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_HOTELIER);
      req.hotelier = await Hotelier.findById(decoded.userId).select(
        "-password"
      );
      next();
    } catch (error) {
      req.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { protect };
