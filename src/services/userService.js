import api from "./api";

export const userService = {
  getMe: () => api.get("/users/me"),
  updateMe: (data) => api.put("/users/me", data),
  changePassword: (data) => api.put("/users/me/password", data),
};
