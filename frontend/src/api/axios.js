import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ─────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};

// ── Vehicles ──────────────────────────────────────────────
export const vehicleApi = {
  getAll:          (params) => api.get('/vehicles', { params }),
  getById:         (id)     => api.get(`/vehicles/${id}`),
  create:          (data)   => api.post('/vehicles', data),
  update:          (id, d)  => api.put(`/vehicles/${id}`, d),
  delete:          (id)     => api.delete(`/vehicles/${id}`),
  updateLocation:  (id, d)  => api.put(`/vehicles/${id}/location`, d),
  getLocation:     (id)     => api.get(`/vehicles/${id}/location`),
};

// ── Bookings ──────────────────────────────────────────────
export const bookingApi = {
  create:       (data) => api.post('/bookings', data),
  getMyBookings:()     => api.get('/bookings/my'),
  getById:      (id)   => api.get(`/bookings/${id}`),
  cancel:       (id)   => api.put(`/bookings/${id}/cancel`),
  updateStatus: (id, s)=> api.put(`/bookings/${id}/status?status=${s}`),
};

// ── Payments ──────────────────────────────────────────────
export const paymentApi = {
  process:       (data)      => api.post('/payments', data),
  getByBooking:  (bookingId) => api.get(`/payments/booking/${bookingId}`),
};

// ── Reviews ───────────────────────────────────────────────
export const reviewApi = {
  getForVehicle: (vehicleId) => api.get(`/reviews/vehicle/${vehicleId}`),
  add:           (data)      => api.post('/reviews', data),
};

// ── Admin ─────────────────────────────────────────────────
export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics'),
  getAllBookings:() => api.get('/admin/bookings'),
  getAllUsers:   () => api.get('/admin/users'),
};

export default api;
