import { createSlice } from "@reduxjs/toolkit";

const hotelierInfoString = localStorage.getItem('hotelierInfo');
const initialState = {
  hotelierInfo: hotelierInfoString ? JSON.parse(hotelierInfoString) : null
};

const hotelierAuthSlice = createSlice({
  name: 'hotelierAuth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.hotelierInfo = action.payload;
      localStorage.setItem('hotelierInfo', JSON.stringify(action.payload));
    },
    logout: (state, action) => {
      state.hotelierInfo = null;
      localStorage.removeItem('hotelierInfo');
    }
  }
})

export const { setCredentials, logout } = hotelierAuthSlice.actions;

export default hotelierAuthSlice.reducer;
