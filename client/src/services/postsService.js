import { api } from './api'

export const postsService = {
  getAll:     ()          => api.get('/posts'),
  getByUser:  (userId)    => api.get(`/posts?userId=${userId}`),
  getComments:(postId)    => api.get(`/posts/${postId}/comments`),
  create:     (data)      => api.post('/posts', data),
  update:     (id, data)  => api.put(`/posts/${id}`, data),
  remove:     (id, data)  => api.delete(`/posts/${id}`, data),
}
