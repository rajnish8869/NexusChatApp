import React, { useState, useEffect, useRef } from 'react';
import { User, CallType, CallStatus } from '../types';

interface CallModalProps {
  isOpen: boolean;
  type: CallType;
  partner: User;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ isOpen, type, partner, onEndCall }) => {
  const [status, setStatus] = useState<CallStatus>(CallStatus.RINGING);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Simulate connection delay
      const ringTimer = setTimeout(() => {
        setStatus(CallStatus.ONGOING);
      }, 2500);

      return () => clearTimeout(ringTimer);
    } else {
      setDuration(0);
      setStatus(CallStatus.RINGING);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (status === CallStatus.ONGOING) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Try to get camera stream if video call
      if (type === CallType.VIDEO && !isVideoOff && navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(err => console.error("Camera access denied or failed", err));
      }
    }
    return () => {
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [status, type, isVideoOff]);

  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center p-4">
      
      {/* Video Background / Avatar */}
      <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {type === CallType.VIDEO && status === CallStatus.ONGOING && !isVideoOff ? (
          <div className="relative w-full h-full">
            {/* Main Video (Partner - Mocked with Image for now as we can't really call) */}
            <img src={partner.avatar} alt="Partner" className="w-full h-full object-cover opacity-80 blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-50 text-xl font-bold">
              [Remote Video Stream Placeholder]
            </div>

            {/* Self View (Mini) */}
            <div className="absolute top-4 right-4 w-24 h-32 md:w-32 md:h-48 bg-black rounded-lg border-2 border-white/20 overflow-hidden shadow-lg">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <img src={partner.avatar} alt={partner.name} className="w-32 h-32 rounded-full border-4 border-nexus-500 shadow-xl" />
              {status === CallStatus.RINGING && (
                <div className="absolute inset-0 rounded-full border-4 border-nexus-400 animate-ping opacity-75"></div>
              )}
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">{partner.name}</h2>
              <p className="text-nexus-300 mt-2 text-lg animate-pulse">
                {status === CallStatus.RINGING ? 'Calling...' : formatDuration(duration)}
              </p>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center space-x-6">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition ${isMuted ? 'bg-white text-gray-900' : 'bg-gray-700/50 text-white hover:bg-gray-600'}`}
            >
              {isMuted ? (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>

            <button 
              onClick={onEndCall}
              className="p-5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transform hover:scale-105 transition"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.36 7.46 6 12 6s8.66 2.36 11.71 5.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
            </button>

            {type === CallType.VIDEO && (
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-full transition ${isVideoOff ? 'bg-white text-gray-900' : 'bg-gray-700/50 text-white hover:bg-gray-600'}`}
              >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};