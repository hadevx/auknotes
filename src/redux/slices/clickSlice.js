import { createSlice } from "@reduxjs/toolkit";

const clickSlice = createSlice({
  name: "click",
  initialState: false,
  reducers: {
    setClicked: (state, action) => {
      return action.payload;
    },
  },
});

export const { setClicked } = clickSlice.actions;
export default clickSlice.reducer;
