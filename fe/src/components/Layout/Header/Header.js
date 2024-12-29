import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <i className="fas fa-book-reader"></i>
                    <span>Thư viện</span>
                </Link>

                <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="nav-link">
                        <i className="fas fa-home"></i>
                        Trang chủ
                    </Link>
                    <Link to="/books" className="nav-link">
                        <i className="fas fa-book"></i>
                        Sách
                    </Link>
                    <Link to="/categories" className="nav-link">
                        <i className="fas fa-list"></i>
                        Thể loại
                    </Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin/dashboard" className="nav-link admin-link">
                            <i className="fas fa-user-shield"></i>
                            Quản trị
                        </Link>
                    )}
                </nav>

                <div className="header-actions">
                    {user ? (
                        <div className="user-menu">
                            <button 
                                className="profile-button"
                                onClick={toggleProfileMenu}
                            >
                                <img 
                                    src={user.avatar || '/default-avatar.png'} 
                                    alt="Avatar"
                                    className="user-avatar"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/default-avatar.png';
                                    }}
                                />
                                <span className="user-name">{user.fullName}</span>
                                <i className="fas fa-chevron-down"></i>
                            </button>

                            <div className={`profile-dropdown ${isProfileMenuOpen ? 'active' : ''}`}>
                                <Link to="/profile" className="dropdown-item">
                                    <i className="fas fa-user"></i>
                                    Thông tin cá nhân
                                </Link>
                                <Link to="/borrows" className="dropdown-item">
                                    <i className="fas fa-book-reader"></i>
                                    Sách đang mượn
                                </Link>
                                <Link to="/history" className="dropdown-item">
                                    <i className="fas fa-history"></i>
                                    Lịch sử mượn
                                </Link>
                                <button onClick={handleLogout} className="dropdown-item logout">
                                    <i className="fas fa-sign-out-alt"></i>
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-button">
                                <i className="fas fa-sign-in-alt"></i>
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="register-button">
                                <i className="fas fa-user-plus"></i>
                                Đăng ký
                            </Link>
                        </div>
                    )}

                    <button 
                        className="mobile-menu-button"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
