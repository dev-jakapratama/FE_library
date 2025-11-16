import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor untuk logging (opsional)
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor untuk error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const bookAPI = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  create: (bookData) => api.post('/books', { book: bookData }),
  update: (id, bookData) => api.put(`/books/${id}`, { book: bookData }),
  delete: (id) => api.delete(`/books/${id}`),
};

export const borrowerAPI = {
  getAll: () => api.get('/borrowers'),
  getById: (id) => api.get(`/borrowers/${id}`),
  create: (borrowerData) => api.post('/borrowers', { borrower: borrowerData }),
  update: (id, borrowerData) => api.put(`/borrowers/${id}`, { borrower: borrowerData }),
  delete: (id) => api.delete(`/borrowers/${id}`),
};

export const loanAPI = {
  getAll: () => api.get('/loans'),
  getActive: () => api.get('/loans/active_loans'),
  getOverdue: () => api.get('/loans/overdue_loans'),
  create: (loanData) => api.post('/loans', { loan: loanData }),
  returnBook: (id) => api.post(`/loans/${id}/return_book`),
};

export default api;