let ioInstance = null;

/**
 * Initialize and store the Socket.io instance
 * @param {object} io - The Socket.io Server instance
 * @returns {object} The initialized Socket.io instance
 */
const initIO = (io) => {
  ioInstance = io;
  return ioInstance;
};

/**
 * Retrieve the active Socket.io instance
 * @returns {object|null} The Socket.io instance or null if not yet initialized
 */
const getIO = () => {
  if (!ioInstance) {
    console.warn('[Socket.io] Warning: getIO() called before io was initialized.');
  }
  return ioInstance;
};

module.exports = {
  initIO,
  getIO
};
