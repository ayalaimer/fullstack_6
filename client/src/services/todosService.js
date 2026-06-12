import { api } from './api'

export const todosService = {
  getByUser: (userId)       => api.get(`/todos?userId=${userId}`),
  create:    (data)         => api.post('/todos', data),
  update:    (id, data)     => api.put(`/todos/${id}`, data),
  remove:    (id)           => api.delete(`/todos/${id}`),
}
