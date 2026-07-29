import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+?[1-9]\d{7,14}|\d{10})$/, 'Enter a valid phone number');

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const phoneLoginSchema = z.object({
  phone: phoneSchema,
});

export const dashboardLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().optional(),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type PhoneLoginInput = z.infer<typeof phoneLoginSchema>;
export type DashboardLoginInput = z.infer<typeof dashboardLoginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;