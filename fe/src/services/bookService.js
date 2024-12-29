import api from './api';

const bookService = {
  getAllBooks: async (params) => {
    const response = await api.get('/books', { params });
    return response.data;
  },

  getBookById: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  createBook: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  updateBook: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },

  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },

  searchBooks: async (query) => {
    const response = await api.get('/books/search', { params: { q: query } });
    return response.data;
  },

  getBooksByCategory: async (category) => {
    const response = await api.get('/books/category/' + category);
    return response.data;
  }
};

export default bookService;
