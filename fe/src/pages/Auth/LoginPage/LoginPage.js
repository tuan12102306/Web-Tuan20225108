import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../../components/Auth/LoginForm/LoginForm';
import './LoginPage.css';

const LoginPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  useEffect(() => {
    // Nếu user đã đăng nhập, chuyển hướng về trang chủ
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <h1>Đăng nhập</h1>
            <p>Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.</p>
          </div>

          {message && (
            <div className="login-message success">
              <i className="fas fa-check-circle"></i>
              {message}
            </div>
          )}

          <LoginForm setUser={setUser} />

          <div className="login-footer">
            <div className="divider">
              <span>Hoặc</span>
            </div>

            <div className="social-login">
              <button className="social-btn google">
                <i className="fab fa-google"></i>
                Đăng nhập với Google
              </button>
              <button className="social-btn facebook">
                <i className="fab fa-facebook-f"></i>
                Đăng nhập với Facebook
              </button>
            </div>

            <div className="additional-links">
              <p>
                Chưa có tài khoản? 
                <a href="/register" className="register-link">
                  Đăng ký ngay
                </a>
              </p>
              <a href="/forgot-password" className="forgot-password-link">
                Quên mật khẩu?
              </a>
            </div>
          </div>
        </div>

        <div className="login-image">
          <img 
            src="/images/login-illustration.svg" 
            alt="Login illustration" 
          />
          <div className="image-overlay">
            <h2>Thư viện Trực tuyến</h2>
            <p>Khám phá kho tàng tri thức với hàng nghìn đầu sách đa dạng</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
