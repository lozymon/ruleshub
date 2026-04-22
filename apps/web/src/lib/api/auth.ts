import { UserDto } from '@ruleshub/types';
import { apiClient } from './client';

export function getMe(token: string): Promise<UserDto> {
  return apiClient.get<UserDto>('/auth/me', { token });
}
