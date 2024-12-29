import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../../components/Common/Loading/Loading';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu thống kê');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon books">
            <i className="fas fa-books"></i>
          </div>
          <div className="stat-info">
            <h3>Tổng số sách</h3>
            <p>{stats.totalBooks}</p>
          </div>
          <Link to="/admin/books" className="stat-link">
            Chi tiết <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>Người dùng</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <Link to="/admin/users" className="stat-link">
            Chi tiết <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon borrows">
            <i className="fas fa-handshake"></i>
          </div>
          <div className="stat-info">
            <h3>Đang mượn</h3>
            <p>{stats.activeBorrows}</p>
          </div>
          <Link to="/admin/borrows" className="stat-link">
            Chi tiết <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-icon overdue">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>Quá hạn</h3>
            <p>{stats.overdueBorrows}</p>
          </div>
          <Link to="/admin/borrows?filter=overdue" className="stat-link">
            Chi tiết <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Thống kê mượn sách</h3>
          {/* Thêm biểu đồ thống kê ở đây */}
        </div>

        <div className="chart-card">
          <h3>Sách phổ biến</h3>
          <div className="popular-books">
            {stats.popularBooks.map(book => (
              <div key={book.id} className="popular-book-item">
                <img 
                  src={book.coverImage} 
                  alt={book.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-book-cover.jpg';
                  }}
                />
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p>{book.borrowCount} lượt mượn</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Hoạt động gần đây</h3>
        <div className="activities-list">
          {stats.recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                <i className={`fas fa-${activity.type === 'borrow' ? 'arrow-right' : 'arrow-left'}`}></i>
              </div>
              <div className="activity-info">
                <p>
                  <strong>{activity.userName}</strong>
                  {activity.type === 'borrow' ? ' đã mượn ' : ' đã trả '}
                  <strong>{activity.bookTitle}</strong>
                </p>
                <span className="activity-time">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
