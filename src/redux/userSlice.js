import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
const initialState = {
    id: "",
    email: "",
    name: "",
    token: ""
}
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginRedux: (state, action) => {
            state.id = action.payload.user.id;
            state.email = action.payload.user.email;
            state.name = action.payload.user.name;
            state.token = action.payload.token;
            toast("User Logged In Successfully");
        },
        logoutRedux: (state, action) => {
            state.user = null;
            localStorage.removeItem("user");
        }
    }
})
export const { loginRedux, logoutRedux } = userSlice.actions

export const userSliceReducer = userSlice.reducer