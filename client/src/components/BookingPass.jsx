import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { getBookingId, getBookingVerificationUrl } from '../utils/booking';

export default function BookingPass({ game, currentUser, isHost }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const bookingId = getBookingId(game?.id);
  const verificationUrl = getBookingVerificationUrl(game?.id, bookingId);

  useEffect(() => {
    if (!game?.id) return;

    // Generate high-resolution, high-contrast QR code
    QRCode.toDataURL(verificationUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });
  }, [game?.id, verificationUrl]);

  let when = 'Time TBD';
  if (game?.starts_at) {
    try {
      const d = new Date(game.starts_at);
      if (!isNaN(d.getTime())) {
        when = d.toLocaleString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
    } catch {
      // fallback
    }
  }

  function handleCopyId() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(bookingId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  function handleCopyLink() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleDownloadQr() {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `AroundUs-Booking-${bookingId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const holderName = isHost
    ? (currentUser?.user_metadata?.name || 'You (Host)')
    : (currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Confirmed Player');

  return (
    <div className="booking-pass-card">
      <div className="booking-pass-glow" aria-hidden="true"></div>

      <div className="booking-pass-header">
        <div className="booking-status-badge">
          <span className="booking-status-dot"></span>
          <span>{isHost ? 'HOST ENTRY PASS' : 'CONFIRMED BOOKING PASS'}</span>
        </div>
        <span className="booking-pass-app">AROUND US</span>
      </div>

      <div className="booking-pass-hero">
        <span className="booking-pass-icon">{game.icon}</span>
        <div>
          <h3 className="booking-pass-title">{game.title}</h3>
          <p className="booking-pass-subtitle">
            {game.place} {game.scope === 'college' && game.college ? `· ${game.college}` : game.scope === 'city' && game.city ? `· ${game.city}` : ''}
          </p>
        </div>
      </div>

      {/* Booking ID box */}
      <div className="booking-id-box">
        <div>
          <div className="booking-id-label">BOOKING ID</div>
          <div className="booking-id-code">{bookingId}</div>
        </div>
        <button
          type="button"
          className="booking-copy-btn"
          onClick={handleCopyId}
          title="Copy Booking ID"
        >
          {copiedId ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>

      {/* QR Code Container */}
      <div className="booking-qr-section">
        <div className="booking-qr-card">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code for Booking ${bookingId}`}
              className="booking-qr-image"
            />
          ) : (
            <div className="booking-qr-placeholder">Generating QR code...</div>
          )}
          <div className="booking-qr-caption">
            <span>📷 SCAN AT VENUE FOR ENTRY</span>
          </div>
        </div>
      </div>

      {/* Booking details metadata */}
      <div className="booking-pass-grid">
        <div className="booking-pass-field">
          <span className="field-name">📅 SCHEDULED TIME</span>
          <strong className="field-val">{when}</strong>
        </div>
        <div className="booking-pass-field">
          <span className="field-name">👤 PASS HOLDER</span>
          <strong className="field-val">{holderName}</strong>
        </div>
        <div className="booking-pass-field">
          <span className="field-name">📍 LOCATION</span>
          <strong className="field-val">{game.place}</strong>
        </div>
        <div className="booking-pass-field">
          <span className="field-name">⚡ STATUS</span>
          <strong className="field-val" style={{ color: '#10b981' }}>VALID & ACTIVE</strong>
        </div>
      </div>

      {/* Action buttons */}
      <div className="booking-pass-actions">
        <button
          type="button"
          className="booking-action-btn secondary"
          onClick={handleCopyLink}
        >
          {copiedLink ? '✓ Link copied' : '🔗 Copy Pass Link'}
        </button>
        <button
          type="button"
          className="booking-action-btn primary"
          onClick={handleDownloadQr}
          disabled={!qrDataUrl}
        >
          📥 Download QR Pass
        </button>
      </div>
    </div>
  );
}
