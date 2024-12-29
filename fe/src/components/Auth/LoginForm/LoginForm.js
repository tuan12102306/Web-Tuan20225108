import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import './LoginForm.css';

const LoginForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Submitting:', formData); // Debug log
            const result = await authService.login(formData.email, formData.password);
            if (result.success) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Password"
                required
            />
            <button type="submit">Đăng nhập</button>
        </form>
    );
};

export default LoginForm;
