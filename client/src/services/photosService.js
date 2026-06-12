import { api } from './api'

export const photosService = {
  getAll:      ()          => api.get('/photos'),
  getByAlbum:  (albumId)   => api.get(`/photos?albumId=${albumId}`),
  create:      (data)      => api.post('/photos', data),
  update:      (id, data)  => api.put(`/photos/${id}`, data),
  remove:      (id)        => api.delete(`/photos/${id}`),
}
