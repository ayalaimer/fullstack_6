import { api } from './api'

export const commentsService = {
  create: (data)      => api.post('/comments', data),
  update: (id, data)  => api.put(`/comments/${id}`, data),
  remove: (id, data)  => api.delete(`/comments/${id}`, data),
}
