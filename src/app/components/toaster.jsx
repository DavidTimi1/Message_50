import { Toaster, toast } from "react-hot-toast";


export const CustomToaster = () => {

    return (
        <Toaster
          position="bottom-right" // Position all toasts
          toastOptions={{
            style: {
              background: 'var(--body2-col)',
              color: 'var(--text-col)',
            },
          }}
        />
    )
}


const colorMap = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-primary',
  warning: 'bg-warning',
  // Default to a neutral color
  default: 'bg-secondary',
};

export const CustomToast = ({ t, message, type = 'default' }) => {
  const colorClass = colorMap[type] || colorMap.default;

  return (
    <div
      className={`d-flex align-items-center bg-dark text-white rounded-3 p-3 shadow-lg`}
      style={{
        // Customize width and margin
        width: 'auto',
        maxWidth: '300px',
        margin: '2px',
        animation: `0.3s ease-in-out ${t.visible ? 'toast-enter' : 'toast-leave'}`
      }}
    >
      {/* Color indicator line on the left */}
      <div className={`rounded-circle me-3 ${colorClass}`} style={{ width: '10px', height: '10px' }}></div>
      
      {/* Toast message content */}
      <div className="flex-grow-1">{message}</div>

      {/* Dismiss button */}
      <button onClick={() => toast.dismiss(t.id)} className="btn-close btn-close-white ms-3" aria-label="Close"></button>
    </div>
  );
};


export const showToast = (message, type = 'default') => {
  toast.custom((t) => (
    <CustomToast t={t} message={message} type={type} />
  ));
};