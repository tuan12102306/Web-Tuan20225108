import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../../components/Auth/RegisterForm/RegisterForm';
import './RegisterPage.css';

const RegisterPage = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu user đã đăng nhập, chuyển hướng về trang chủ
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-content">
          <div className="register-header">
            <h1>Đăng ký tài khoản</h1>
            <p>Tạo tài khoản để trải nghiệm đầy đủ tính năng của thư viện</p>
          </div>

          <RegisterForm />

          <div className="register-footer">
            <div className="divider">
              <span>Hoặc</span>
            </div>

            <div className="social-register">
              <button className="social-btn google">
                <i className="fab fa-google"></i>
                Đăng ký với Google
              </button>
              <button className="social-btn facebook">
                <i className="fab fa-facebook-f"></i>
                Đăng ký với Facebook
              </button>
            </div>

            <div className="additional-links">
              <p>
                Đã có tài khoản? 
                <a href="/login" className="login-link">
                  Đăng nhập ngay
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="register-image">
          <img 
            src="/images/register-illustration.svg" 
            alt="Register illustration" 
          />
          <div className="image-overlay">
            <h2>Tham gia cùng chúng tôi</h2>
            <p>Khám phá thế giới tri thức với hàng nghìn đầu sách chất lượng</p>
            <ul className="feature-list">
              <li>
                <i className="fas fa-check-circle"></i>
                Mượn sách trực tuyến dễ dàng
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                Cập nhật sách mới thường xuyên
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                Hỗ trợ 24/7
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
