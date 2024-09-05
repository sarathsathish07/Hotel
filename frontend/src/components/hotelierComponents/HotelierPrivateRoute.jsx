import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import React from "react";

const HotelierPrivateRoute = () => {
  const { hotelierInfo } = useSelector((state) => state.hotelierAuth);
  return hotelierInfo ? <Outlet /> : <Navigate to="/hotelier/login" replace />;
};

export default HotelierPrivateRoute;
