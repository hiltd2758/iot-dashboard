import api from "./axios";
import type { ApiResponse, UserProfileDTO } from "@/types";

export const userApi = {
  getProfile: (username: string) =>
    api.get<ApiResponse<UserProfileDTO>>(`/api/v1/users/${username}`),
};
