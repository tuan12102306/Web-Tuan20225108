import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book }) => {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-cover">
        <img 
          src={book.coverImage || '/images/default-book-cover.jpg'} 
          alt={book.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/default-book-cover.jpg';
          }}
        />
        {book.status === 'available' ? (
          <span className="status-badge available">
            <i className="fas fa-check"></i>
            Có sẵn
          </span>
        ) : (
          <span className="status-badge borrowed">
            <i className="fas fa-clock"></i>
            Đã mượn
          </span>
        )}
      </div>
      
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">
          <i className="fas fa-user-edit"></i>
          {book.author}
        </p>
        
        <div className="book-meta">
          <span className="book-category">
            <i className="fas fa-bookmark"></i>
            {book.category}
          </span>
          
          <span className="book-rating">
            <i className="fas fa-star"></i>
            {book.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
