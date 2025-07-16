import './CustomAlert.css';

const CustomAlert = ({ message, onClose, onCancel = null }) => {
  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert-box">
        <p className="alert-message">{message}</p>
        <div className="alert-button-wrapper">
          <button onClick={onClose}>확인</button>
          {onCancel && (
            <button onClick={onCancel} style={{ marginLeft: '10px' }}>취소</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
