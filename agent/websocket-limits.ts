/**
 * WebSocket inbound message limits — Issue #135.
 *
 * Reject oversized frames before JSON.parse to limit memory use and parsing cost.
 */

/** Default max inbound WebSocket message size (64 KiB). */
export const DEFAULT_MAX_WS_MESSAGE_BYTES = 64 * 1024;

/**
 * Returns an error message when `byteLength` exceeds `maxBytes`, otherwise null.
 */
export function wsMessageSizeError(
  byteLength: number,
  maxBytes: number = DEFAULT_MAX_WS_MESSAGE_BYTES,
): string | null {
  if (!Number.isFinite(byteLength) || byteLength < 0) {
    return 'message size is invalid';
  }
  if (byteLength > maxBytes) {
    return `message exceeds maximum size of ${maxBytes} bytes (got ${byteLength})`;
  }
  return null;
}
