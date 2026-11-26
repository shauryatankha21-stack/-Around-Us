/**
 * Utility functions for Booking ID and QR Code generation.
 */

export function getBookingId(gameId) {
  if (!gameId) return 'AU-BK-00000000';
  // Strip non-alphanumeric chars, uppercase, grab 8 characters
  const clean = String(gameId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
  return `AU-BK-${clean.padEnd(8, '0')}`;
}

export function getBookingVerificationUrl(gameId, bookingId) {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://around-us-ashen.vercel.app';
  return `${origin}/?booking=${encodeURIComponent(bookingId)}&game=${encodeURIComponent(gameId)}`;
}
