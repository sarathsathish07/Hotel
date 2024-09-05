import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";

const protect = expressAsyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwtAdmin;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
      req.admin = decoded;
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized ,invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not Authorized no token");
  }
});

export { protect };
