import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface userDataLogined {
  id?: number;
  name: string;
  email?: string;
  authentication: boolean;
  phone: string;
  role: string;

  accessToken: string;
  refreshToken: string;
}
const initialState: userDataLogined = {
  name: "",
  authentication: false,
  phone: "",
  role: "",
  accessToken: "",
  refreshToken: "",
};

export const userSlice = createSlice({
  name: "user",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    saveUserlogined: (
      state,
      action: PayloadAction<Partial<userDataLogined> | null>,
    ) => {
      if (!action.payload) return initialState;

      return { ...state, ...action.payload };
    },

    // Use the PayloadAction type to declare the contents of `action.payload`
  },
});
export const { saveUserlogined } = userSlice.actions;

export default userSlice.reducer;
