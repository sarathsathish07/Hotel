import { createSlice } from "@reduxjs/toolkit";


const adminInfoString = localStorage.getItem('adminInfo');
const initialState = {
    adminInfo: adminInfoString ? JSON.parse(adminInfoString) : null
};

const adminAuthSlice = createSlice ({
    name:'adminAuth',
    initialState,
    reducers:{
        setCredentials:(state,action)=>{
            state.adminInfo = action.payload;
            localStorage.setItem('adminInfo',JSON.stringify(action.payload))
        },
        logout:(state,action)=>{
            state.adminInfo=null;
            localStorage.removeItem('adminInfo')
        }
    }
})


export const {setCredentials,logout} = adminAuthSlice.actions
export default adminAuthSlice.reducer