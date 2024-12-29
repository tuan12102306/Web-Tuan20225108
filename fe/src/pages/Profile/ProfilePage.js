import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Common/Loading/Loading';
import './ProfilePage.css';

const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [borrowHistory, setBorrowHistory] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserData();
    fetchBorrowHistory();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải thông tin người dùng');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        address: data.address || ''
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowHistory = async () => {
    try {
      const response = await fetch('/api/users/borrows', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải lịch sử mượn sách');
      }

      const data = await response.json();
      setBorrowHistory(data);
    } catch (error) {
      console.error('Error fetching borrow history:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (editMode && formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          ...(formData.newPassword && {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật thông tin');
      }

      // Cập nhật user state
      setUser(prev => ({
        ...prev,
        fullName: formData.fullName
      }));

      // Reset form password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setEditMode(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Thông tin cá nhân</h1>
        <button 
          className="edit-button"
          onClick={() => setEditMode(!editMode)}
        >
          <i className={`fas fa-${editMode ? 'times' : 'edit'}`}></i>
          {editMode ? 'Hủy' : 'Chỉnh sửa'}
        </button>
      </div>

      <div className="profile-content">
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <i className="fas fa-user"></i>
              Họ tên
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!editMode}
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && (
              <span className="error-message">{errors.fullName}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-envelope"></i>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="disabled"
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-phone"></i>
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-map-marker-alt"></i>
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>

          {editMode && (
            <>
              <div className="form-group">
                <label>
                  <i className="fas fa-lock"></i>
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={errors.currentPassword ? 'error' : ''}
                />
                {errors.currentPassword && (
                  <span className="error-message">{errors.currentPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-key"></i>
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? 'error' : ''}
                />
                {errors.newPassword && (
                  <span className="error-message">{errors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-check"></i>
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              <button type="submit" className="save-button">
                <i className="fas fa-save"></i>
                Lưu thay đổi
              </button>
            </>
          )}
        </form>

        <div className="borrow-history">
          <h2>Lịch sử mượn sách</h2>
          {borrowHistory.length > 0 ? (
            <div className="history-list">
              {borrowHistory.map(borrow => (
                <div key={borrow.id} className="history-item">
                  <div className="book-info">
                    <img 
                      src={borrow.bookCover} 
                      alt={borrow.bookTitle}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-book-cover.jpg';
                      }}
                    />
                    <div>
                      <h3>{borrow.bookTitle}</h3>
                      <p className="borrow-dates">
                        <span>
                          <i className="fas fa-calendar-plus"></i>
                          Ngày mượn: {new Date(borrow.borrowDate).toLocaleDateString()}
                        </span>
                        <span>
                          <i className="fas fa-calendar-check"></i>
                          {borrow.returnDate ? (
                            `Ngày trả: ${new Date(borrow.returnDate).toLocaleDateString()}`
                          ) : (
                            `Hạn trả: ${new Date(borrow.dueDate).toLocaleDateString()}`
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className={`status-badge ${borrow.status}`}>
                    {borrow.status === 'active' && 'Đang mượn'}
                    {borrow.status === 'overdue' && 'Quá hạn'}
                    {borrow.status === 'returned' && 'Đã trả'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-history">
              <i className="fas fa-book-reader"></i>
              <p>Bạn chưa mượn sách nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
