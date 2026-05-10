import api from "./axios";
import type {
  ApiResponse,
  LoginRequestDTO,
  LoginResponseDTO,
  RegistrationDTO,
  TokenResponseDTO,
  RefreshTokenDTO,
} from "@/types";

export const authApi = {
  login: (body: LoginRequestDTO) =>
    api.post<ApiResponse<LoginResponseDTO>>("/api/v1/auth/login", body),

  signUp: (body: RegistrationDTO) =>
    api.post<ApiResponse<void>>("/api/v1/auth/sign-up", body),

  logout: (refreshToken: string) =>
    api.post<void>("/api/v1/auth/logout", { refreshToken } as RefreshTokenDTO, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }),

  refreshToken: (token: string) =>
    api.post<ApiResponse<TokenResponseDTO>>(
      `/api/v1/auth/refresh-token/${token}`,
    ),

  verifyUser: (token: string) =>
    api.post<ApiResponse<void>>(`/api/v1/auth/verification/${token}`),

  refreshUserVerification: (username: string) =>
    api.post<ApiResponse<void>>(
      "/api/v1/auth/refresh-user-verification",
      null,
      {
        params: { username },
      },
    ),
};
