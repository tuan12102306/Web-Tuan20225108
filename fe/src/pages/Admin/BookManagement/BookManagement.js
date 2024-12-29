import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BookManagement.css';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    publisher: '',
    publishYear: '',
    isbn: '',
    description: '',
    totalCopies: ''
  });

  useEffect(() => {
    fetchBooks();
  }, [currentPage, searchQuery]);

  const fetchBooks = async () => {
    try {
      // Giả lập API - thay bằng API thực tế
      const response = await fetch(`/api/books?page=${currentPage}&search=${searchQuery}`);
      const data = await response.json();
      setBooks(data.books);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sách:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedBook) {
        // Cập nhật sách
        await fetch(`/api/books/${selectedBook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Thêm sách mới
        await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setShowModal(false);
      fetchBooks();
    } catch (error) {
      console.error('Lỗi khi lưu sách:', error);
    }
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData(book);
    setShowModal(true);
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Bạn có chắc muốn xóa sách này?')) {
      try {
        await fetch(`/api/books/${bookId}`, {
          method: 'DELETE'
        });
        fetchBooks();
      } catch (error) {
        console.error('Lỗi khi xóa sách:', error);
      }
    }
  };

  return (
    <div className="book-management">
      <div className="management-header">
        <h1>Quản lý sách</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            className="add-button"
            onClick={() => {
              setSelectedBook(null);
              setFormData({
                title: '',
                author: '',
                category: '',
                publisher: '',
                publishYear: '',
                isbn: '',
                description: '',
                totalCopies: ''
              });
              setShowModal(true);
            }}
          >
            Thêm sách mới
          </button>
        </div>
      </div>

      <div className="books-table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th>Tên sách</th>
              <th>Tác giả</th>
              <th>Thể loại</th>
              <th>Số lượng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>{book.availableCopies}/{book.totalCopies}</td>
                <td>
                  <span className={`status ${book.available ? 'available' : 'unavailable'}`}>
                    {book.available ? 'Có sẵn' : 'Đã mượn hết'}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(book)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(book.id)}
                  >
                    Xóa
                  </button>
                  <Link 
                    to={`/books/${book.id}`}
                    className="view-button"
                  >
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Trang trước
        </button>
        <span>Trang {currentPage} / {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Trang sau
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên sách</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tác giả</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Thể loại</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nhà xuất bản</label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Năm xuất bản</label>
                  <input
                    type="number"
                    name="publishYear"
                    value={formData.publishYear}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số lượng</label>
                  <input
                    type="number"
                    name="totalCopies"
                    value={formData.totalCopies}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-button">
                  {selectedBook ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;
