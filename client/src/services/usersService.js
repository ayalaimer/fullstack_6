import { api } from './api'

export const usersService = {
  updateProfile:  (id, data) => api.put(`/users/${id}`, data),
  updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
}
