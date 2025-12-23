import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Peer from 'simple-peer';
import { initSocket, joinRoom, onVideoSignal, sendVideoSignal } from '../../services/socket';
import {
  MicrophoneIcon,
  VideoCameraIcon,
  PhoneXMarkIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import {
  MicrophoneIcon as MicrophoneSolid,
  VideoCameraIcon as VideoCameraSolid
} from '@heroicons/react/24/solid';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);

  const myVideoRef = useRef();
  const peerVideoRef = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    const socket = initSocket();

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error('Error accessing media devices:', err);
      });

    joinRoom(roomId);

    onVideoSignal((data) => {
      if (data.type === 'offer') {
        setReceivingCall(true);
        setCaller(data.from);
        setCallerSignal(data.signal);
      } else if (data.type === 'answer' && connectionRef.current) {
        connectionRef.current.signal(data.signal);
      }
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
    };
  }, [roomId]);

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      sendVideoSignal({
        roomId,
        type: 'offer',
        signal: data
      });
    });

    peer.on('stream', (peerStream) => {
      if (peerVideoRef.current) {
        peerVideoRef.current.srcObject = peerStream;
      }
    });

    onVideoSignal((data) => {
      if (data.type === 'answer') {
        peer.signal(data.signal);
        setCallAccepted(true);
      }
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      sendVideoSignal({
        roomId,
        type: 'answer',
        signal: data
      });
    });

    peer.on('stream', (peerStream) => {
      if (peerVideoRef.current) {
        peerVideoRef.current.srcObject = peerStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    navigate(-1);
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Peer Video (Large) */}
        <div className="w-full h-full flex items-center justify-center">
          {callAccepted ? (
            <video
              ref={peerVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <VideoCameraIcon className="w-12 h-12 text-gray-400" />
              </div>
              {receivingCall && !callAccepted ? (
                <div>
                  <p className="text-xl mb-4">Incoming call...</p>
                  <button
                    onClick={answerCall}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Answer
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-xl mb-4">Ready to start the call</p>
                  <button
                    onClick={callUser}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Start Call
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* My Video (Small) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoCameraIcon className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {isMuted ? (
              <MicrophoneSolid className="w-6 h-6" />
            ) : (
              <MicrophoneIcon className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {isVideoOff ? (
              <VideoCameraSolid className="w-6 h-6" />
            ) : (
              <VideoCameraIcon className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={leaveCall}
            className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <PhoneXMarkIcon className="w-6 h-6" />
          </button>

          <button className="p-4 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
            <ChatBubbleLeftIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
