import api from './api';

const borrowService = {
  borrowBook: async (bookId) => {
    const response = await api.post('/borrows', { bookId });
    return response.data;
  },

  returnBook: async (borrowId) => {
    const response = await api.post(`/borrows/${borrowId}/return`);
    return response.data;
  },

  getUserBorrows: async () => {
    const response = await api.get('/borrows/user');
    return response.data;
  },

  getAllBorrows: async (params) => {
    const response = await api.get('/borrows', { params });
    return response.data;
  },

  getBorrowById: async (id) => {
    const response = await api.get(`/borrows/${id}`);
    return response.data;
  }
};

export default borrowService;
