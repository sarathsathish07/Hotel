import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetUserProfileQuery } from '../../slices/usersApiSlice.js';
import { logout } from '../../slices/authSlice.js';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { data, error } = useGetUserProfileQuery();

  useEffect(() => {
    if (error && error.status === 401) {
      dispatch(logout());
    }
  }, [error, dispatch]);

  return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;
