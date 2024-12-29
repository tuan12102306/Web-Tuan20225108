import { useState, useEffect } from 'react';
import Loading from '../../../components/Common/Loading/Loading';
import Pagination from '../../../components/Common/Pagination/Pagination';
import './BorrowManagement.css';

const BorrowManagement = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, overdue, returned
  const [sortConfig, setSortConfig] = useState({
    key: 'borrowDate',
    direction: 'desc'
  });

  useEffect(() => {
    fetchBorrows();
  }, [currentPage, searchQuery, filter, sortConfig]);

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/borrows?page=${currentPage}&search=${searchQuery}&filter=${filter}&sort=${sortConfig.key}&direction=${sortConfig.direction}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Không thể tải danh sách mượn sách');
      }

      const data = await response.json();
      setBorrows(data.borrows);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching borrows:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBorrows();
  };

  const handleReturn = async (borrowId) => {
    if (!window.confirm('Xác nhận trả sách?')) return;

    try {
      const response = await fetch(`/api/admin/borrows/${borrowId}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái trả sách');
      }

      // Cập nhật trạng thái trong danh sách
      setBorrows(prev => 
        prev.map(borrow => 
          borrow.id === borrowId 
            ? { ...borrow, status: 'returned', returnDate: new Date().toISOString() }
            : borrow
        )
      );

      alert('Cập nhật trạng thái trả sách thành công!');
    } catch (error) {
      console.error('Error returning book:', error);
      alert(error.message);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'badge-primary';
      case 'overdue':
        return 'badge-danger';
      case 'returned':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang mượn';
      case 'overdue':
        return 'Quá hạn';
      case 'returned':
        return 'Đã trả';
      default:
        return 'Không xác định';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="borrow-management">
      <div className="management-header">
        <h1>Quản lý mượn trả sách</h1>
        
        <div className="header-actions">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên sách hoặc người mượn..."
            />
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>

          <div className="filter-buttons">
            <button
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </button>
            <button
              className={`filter-button ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Đang mượn
            </button>
            <button
              className={`filter-button ${filter === 'overdue' ? 'active' : ''}`}
              onClick={() => setFilter('overdue')}
            >
              Quá hạn
            </button>
            <button
              className={`filter-button ${filter === 'returned' ? 'active' : ''}`}
              onClick={() => setFilter('returned')}
            >
              Đã trả
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="borrows-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('borrowDate')}>
                Ngày mượn
                {sortConfig.key === 'borrowDate' && (
                  <i className={`fas fa-sort-${sortConfig.direction}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('dueDate')}>
                Hạn trả
                {sortConfig.key === 'dueDate' && (
                  <i className={`fas fa-sort-${sortConfig.direction}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('bookTitle')}>
                Sách
                {sortConfig.key === 'bookTitle' && (
                  <i className={`fas fa-sort-${sortConfig.direction}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('userName')}>
                Người mượn
                {sortConfig.key === 'userName' && (
                  <i className={`fas fa-sort-${sortConfig.direction}`}></i>
                )}
              </th>
              <th onClick={() => handleSort('status')}>
                Trạng thái
                {sortConfig.key === 'status' && (
                  <i className={`fas fa-sort-${sortConfig.direction}`}></i>
                )}
              </th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map(borrow => (
              <tr key={borrow.id}>
                <td>{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                <td>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                <td>
                  <div className="book-info-cell">
                    <img 
                      src={borrow.bookCover} 
                      alt={borrow.bookTitle}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-book-cover.jpg';
                      }}
                    />
                    <span>{borrow.bookTitle}</span>
                  </div>
                </td>
                <td>{borrow.userName}</td>
                <td>
                  <span className={`status-badge ${getBadgeClass(borrow.status)}`}>
                    {getStatusText(borrow.status)}
                  </span>
                </td>
                <td>
                  {borrow.status !== 'returned' && (
                    <button
                      className="return-button"
                      onClick={() => handleReturn(borrow.id)}
                    >
                      <i className="fas fa-undo"></i>
                      Trả sách
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default BorrowManagement;
