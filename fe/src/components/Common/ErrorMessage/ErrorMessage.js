import './ErrorMessage.css';

const ErrorMessage = ({ message }) => {
  return (
    <div className="error-message">
      <i className="fas fa-exclamation-circle"></i>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
