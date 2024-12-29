import { useState, useEffect, useRef } from 'react';
import './BookSearch.css';

const BookSearch = ({ onSearch, onCategoryChange, onSortChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch danh sách categories từ API
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Xử lý search với debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsLoading(true);

    // Clear timeout cũ nếu có
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set timeout mới
    searchTimeout.current = setTimeout(() => {
      onSearch(value);
      setIsLoading(false);
    }, 500);
  };

  // Xử lý clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="book-search">
      <div className="search-container">
        <div className="search-input-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {isLoading && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
            </div>
          )}
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="filters">
          <select 
            onChange={(e) => onCategoryChange(e.target.value)}
            className="category-select"
          >
            <option value="">Tất cả thể loại</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select 
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="title">Sắp xếp theo tên</option>
            <option value="publishYear">Năm xuất bản</option>
            <option value="author">Tác giả</option>
            <option value="popularity">Độ phổ biến</option>
          </select>
        </div>
      </div>

      {searchTerm && (
        <div className="search-tags">
          <div className="search-tag">
            <span>Từ khóa: {searchTerm}</span>
            <button onClick={handleClearSearch}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSearch;
