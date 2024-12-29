import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <p className="loading-text">Đang tải...</p>
    </div>
  );
};

export default Loading;
