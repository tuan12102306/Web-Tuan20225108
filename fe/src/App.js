import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Layout/Header/Header';
import Footer from './components/Layout/Footer/Footer';
import HomePage from './pages/Home/HomePage';
import BookList from './components/Books/BookList/BookList';
import BookDetail from './pages/Books/BookDetail';
import LoginPage from './pages/Auth/LoginPage/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage/RegisterPage';
import Profile from './pages/Profile/ProfilePage';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import BookManagement from './pages/Admin/BookManagement/BookManagement';
import UserManagement from './pages/Admin/UserManagement/UserManagement';
import BorrowManagement from './pages/Admin/BorrowManagement/BorrowManagement';
import userService from './services/userService';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header user={user} setUser={setUser} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/books" element={<BookManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/borrows" element={<BorrowManagement />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;