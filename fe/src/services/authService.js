import api from './api';

const authService = {
    login: async (email, password) => {
        try {
            console.log('Login attempt:', { email });
            const response = await api.post('/auth/login', {
                email,
                password
            });
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                return response.data;
            }
            throw new Error(response.data.message);
        } catch (error) {
            console.error('Login error:', error);
            throw error.response?.data || { message: 'Đăng nhập thất bại' };
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                return response.data.data;
            }
            throw new Error(response.data.message);
        } catch (error) {
            console.error('Register error:', error);
            throw error.response?.data || error;
        }
    }
};

export default authService;
