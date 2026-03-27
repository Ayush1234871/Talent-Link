import { useEffect, useState } from "react";

const Toast = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation slightly before the toast is removed from DOM
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`toast ${type} ${isExiting ? "exit" : "enter"}`}>
      <div className="toast-content">
        {type === "success" && <span className="toast-icon">✓</span>}
        {type === "error" && <span className="toast-icon">✕</span>}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={() => {
        setIsExiting(true);
        setTimeout(onClose, 3000);
      }}>
        ×
      </button>
    </div>
  );
};

export default Toast;
