import { createSlice } from "@reduxjs/toolkit";

export type LayoutState = {
  sideBarOpen: boolean;
  addSiteModal: boolean;
  bloggerModal?: boolean;
};

const initialState: LayoutState = {
  sideBarOpen: false,
  addSiteModal: false,
  bloggerModal: false,
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sideBarOpen = !state.sideBarOpen;
    },
    toggleAddSiteModal: (state) => {
      state.addSiteModal = !state.addSiteModal;
    },
    closeAddSiteModal: (state) => {
      state.addSiteModal = false;
    },
    closeSidebar: (state) => {
      state.sideBarOpen = false;
    },
    closeBloggerModal: (state) => {
      state.bloggerModal = false;
    },
    showBloggerModal: (state) => {
      state.bloggerModal = true;
    },
  },
});

export const {
  toggleSidebar,
  toggleAddSiteModal,
  closeSidebar,
  showBloggerModal,
  closeBloggerModal,
  closeAddSiteModal,
} = layoutSlice.actions;
export default layoutSlice.reducer;
