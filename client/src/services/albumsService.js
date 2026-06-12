import { api } from './api'

export const albumsService = {
  getAll:      ()          => api.get('/albums'),
  getByUser:   (userId)    => api.get(`/albums?userId=${userId}`),
  getPhotos:   (albumId)   => api.get(`/albums/${albumId}/photos`),
  create:      (data)      => api.post('/albums', data),
  update:      (id, data)  => api.put(`/albums/${id}`, data),
  remove:      (id)        => api.delete(`/albums/${id}`),
}
