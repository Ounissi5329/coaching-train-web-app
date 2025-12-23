import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false
    });
  }
  return socket;
};

export const connectSocket = () => {
  if (socket) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export const joinRoom = (roomId) => {
  if (socket) {
    socket.emit('join_room', roomId);
  }
};

export const sendMessage = (data) => {
  if (socket) {
    socket.emit('send_message', data);
  }
};

export const sendVideoSignal = (data) => {
  if (socket) {
    socket.emit('video_signal', data);
  }
};

export const onReceiveMessage = (callback) => {
  if (socket) {
    socket.on('receive_message', callback);
  }
};

export const onVideoSignal = (callback) => {
  if (socket) {
    socket.on('video_signal', callback);
  }
};

export const getSocket = () => socket;

export default socket;
