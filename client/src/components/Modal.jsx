export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal" onClick={handleBackdrop}>
      <div className="modal-box">
        <button className="x" type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
