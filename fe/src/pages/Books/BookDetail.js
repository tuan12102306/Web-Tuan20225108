import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../../components/Common/Loading/Loading';
import bookService from '../../services/bookService';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const data = await bookService.getBookById(id);
      setBook(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error">{error}</div>;
  if (!book) return <div className="error">Không tìm thấy sách</div>;

  return (
    <div className="book-detail">
      {/* Book detail content */}
    </div>
  );
};

export default BookDetail;
