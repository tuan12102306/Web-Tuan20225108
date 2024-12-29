import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AdminRoute = ({ user }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return user?.role === 'admin' ? <Outlet /> : null;
};

export default AdminRoute;
