import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả các trang nếu tổng số trang ít hơn hoặc bằng maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(1);
      
      // Tính toán các trang ở giữa
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Thêm dấu ... nếu cần
      if (start > 2) {
        pages.push('...');
      }
      
      // Thêm các trang ở giữa
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Thêm dấu ... nếu cần
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Luôn hiển thị trang cuối
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          className={`pagination-button ${
            page === currentPage ? 'active' : ''
          } ${page === '...' ? 'ellipsis' : ''}`}
          onClick={() => page !== '...' && onPageChange(page)}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;
