'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Prediction {
  box: [number, number, number, number];
  name: string;
  confidence: number;
  distance: number;
}

interface AttendanceLog {
  id: string;
  name: string;
  avatar: string;
  confidence: number;
  department: string;
  time: string;
  status: 'Present' | 'Late' | 'Absent';
}

const DEPARTMENTS: Record<string, string> = {
  'Nguyen Van A': 'Marketing Department',
  'Tran Minh': 'Engineering',
  'Le Hoa': 'Human Resources',
  'Phan Duy': 'Security',
  'Marcus Thorne': 'Computer Science',
  'Elena Rodriguez': 'Engineering',
  'Aria Vance': 'Marketing Department',
};

const AVATARS: Record<string, string> = {
  'Nguyen Van A': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtuQK5IJJs-7oo5u8QZ8vTuorBbDFTx8GtZV6fREXOroaao3jnz74ByjhbS__Qp9ESt5nlS4u0iEaTYf4cTi8UDGFBygobNNybzgWZDRW5Q1HsbXCg9RAkSXihbqARdq5xv5G7RvYoyzU4PTXkNNwkz_hzEHaR2jL3LBIVWcj_0j1shIcNPxVQKVbugHfHVpq-JgG-wTV67us2A74w-dhUawjaUQmWIpEauqMHpTlm2_kyT5llWF66eJCaXrXwBXZHnTFoMsN8cIk',
  'Tran Minh': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQGQpFK6qcZhNCOAGq3km17vhExiaWBe-07lPJZruLDxVWlZPSEGQzQKr3TCGdI1ZQH1BZBLzPY2O10y_abfrArg7lO6Gs4cavINrRHw-_jJKmHy79MhohBJPTQx2ifAgaHg6ZPEkWU3hoALmZfLU27dh0N6nIYUGCOdTtzT_SB-xyaf0g7BvHe6j62BU_1MYCrvLY98fV7mdXMyy0z--YFYUQomrMdXhhDHAREV1uK68cMHCWHsMXwhd0b9RhfstBmEbmWFn6dG8',
  'Le Hoa': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzE-q-59yjuh0c5uzjYu3waD0bjIONRWbtF8zJn5MARWdzo0A14UuAVAh65k_qjzRzwBY1-pSQgcRbhXoLjrSP6S_jD9JW3ytRCITA1BoVHLsISdQ3fi4PWl8emzajBHP5pdsfSxelY5-XvjWCva5aXN0iVQtp95knndsCgSa6KfGj6dpGmeHsa0twFrAmay12ZQvOeRU4f2YkViQBo9Q8g8ZPGOYi72mQ3fJ4YhkfTEXd7VfItzBJw327zyiB9lE7hVC31pdzg9Q',
  'Phan Duy': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU-y06p3POTVS8nYjdU3USZrs2itZs-sK2654je6skGZosPMEmLZI5-pdbEwINm9QqnyhdidD5LVCbDXPBiW6ut5VOYEtFFc76lTflF4_j0zdJz9ANpFaeInedZAlQz1vB3RXOPgmq8G9R92JXGJVu8SMP1GP5fIpOttXaxIDaO5hR1nt6xFbpt-3ZA4ezxx7b5sUWmTAoNS9j9zhNLWJMxdhFTz42fUOiZeMEH9nI3QzO_VV7uLTSER-FJMJSPmowsfqe6h6sJXg',
  'Default': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx0PuwT7IPmY_td5CEcVhI9ZFNK_Dl49gLF4y6FSpam8gBGgzyiexSc3S2s1aYlbfXV1YJqGvBn5x5-pZOBGYSr6pYzqduBSskKRSOSaz5rSwCOaJl3FzLVbpelJeISdjEetNyzkl6Wl8bScIWpwoMoaTvQaRMaeK9q7WnP76gPEmjam0GdGmI52gOG6yKei7hzzg4My7vLSP9fo4hleU9oqYtHEBcpRjOLTq70TbJ008ip-Fl41apAP9qSNLOYhvOEt6NQyZ3rV4'
};

export default function LiveAttendancePage() {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showBoxes, setShowBoxes] = useState(true);
  const [latency, setLatency] = useState(0);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isAttendanceRunning, setIsAttendanceRunning] = useState(false);

  // Khởi tạo nhật ký điểm danh ban đầu
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([
    {
      id: 'SV-1002-A',
      name: 'Tran Minh',
      avatar: AVATARS['Tran Minh'],
      confidence: 0.941,
      department: 'Engineering',
      time: '14:30:45',
      status: 'Present',
    },
    {
      id: 'SV-1003-B',
      name: 'Le Hoa',
      avatar: AVATARS['Le Hoa'],
      confidence: 0.918,
      department: 'Human Resources',
      time: '14:28:12',
      status: 'Present',
    },
    {
      id: 'SV-UNKNOWN',
      name: 'Unknown Person',
      avatar: '',
      confidence: 0.420,
      department: 'Unregistered',
      time: '14:25:33',
      status: 'Absent',
    },
    {
      id: 'SV-1004-D',
      name: 'Phan Duy',
      avatar: AVATARS['Phan Duy'],
      confidence: 0.965,
      department: 'Security',
      time: '14:12:00',
      status: 'Present',
    },
  ]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<Record<string, number>>({});

  // Cài đặt camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (error) {
      console.error('Lỗi truy cập camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    stopPredictionLoop();
  };

  const handleCameraToggle = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Vòng lặp quét dự đoán
  const stopPredictionLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAttendanceRunning(false);
    setPredictions([]);
  };

  const captureFrameBase64 = (): string | null => {
    if (!videoRef.current || !canvasRef.current || !isCameraOn) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const startPredictionLoop = () => {
    setIsAttendanceRunning(true);
    intervalRef.current = setInterval(async () => {
      const startTime = performance.now();
      const base64Image = captureFrameBase64();
      if (!base64Image) return;

      try {
        const response = await fetch('http://localhost:3000/api/v1/faces/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });
        const duration = Math.round(performance.now() - startTime);
        setLatency(duration);

        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success' && result.predictions) {
            const preds: Prediction[] = result.predictions;
            setPredictions(preds);

            // Xử lý ghi nhận nhật ký điểm danh tự động
            preds.forEach((pred) => {
              const name = pred.name;
              const now = Date.now();
              const lastLogged = cooldownRef.current[name] || 0;

              // Chỉ log nếu không nằm trong thời gian chờ cooldown (10 giây)
              if (name !== 'Unknown' && now - lastLogged > 10000) {
                cooldownRef.current[name] = now;
                const formattedTime = new Date().toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                const newLog: AttendanceLog = {
                  id: `SV-${Math.floor(1000 + Math.random() * 9000)}-D`,
                  name: name,
                  avatar: AVATARS[name] || AVATARS['Default'],
                  confidence: pred.confidence,
                  department: DEPARTMENTS[name] || 'General Department',
                  time: formattedTime,
                  status: 'Present',
                };

                setAttendanceLogs((prev) => [newLog, ...prev.slice(0, 9)]);
              }
            });
          }
        }
      } catch (error) {
        console.error('Lỗi API predict:', error);
      }
    }, 400);
  };

  const toggleAttendance = () => {
    if (isAttendanceRunning) {
      stopPredictionLoop();
    } else {
      if (!isCameraOn) {
        startCamera().then(() => startPredictionLoop());
      } else {
        startPredictionLoop();
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 w-full h-16 px-lg flex justify-between items-center bg-surface border-b border-outline-variant">
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Live Attendance View</h2>
        <div className="flex items-center gap-lg">
          <div
            onClick={toggleAttendance}
            className={`flex items-center gap-sm px-sm py-xs rounded-full cursor-pointer transition-colors ${
              isAttendanceRunning
                ? 'bg-error-container text-on-error-container'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAttendanceRunning ? 'bg-error live-indicator' : 'bg-outline'}`}></span>
            <span className="font-label-caps text-[10px] uppercase font-bold tracking-wide">
              {isAttendanceRunning ? 'Live Transmission' : 'Scanner Paused'}
            </span>
          </div>
          <div className="flex items-center gap-md">
            <button className="material-symbols-outlined p-sm hover:bg-surface-container-high rounded-full transition-colors active:opacity-80">
              notifications
            </button>
            <button className="material-symbols-outlined p-sm hover:bg-surface-container-high rounded-full transition-colors active:opacity-80">
              account_circle
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="p-lg flex gap-lg h-[calc(100vh-64px)] overflow-hidden">
        {/* Left: Video feed and controls */}
        <div className="flex-[3] flex flex-col gap-lg overflow-hidden">
          {/* Controls Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-lg">
              <button
                onClick={handleCameraToggle}
                className={`flex items-center gap-sm px-lg py-sm rounded-lg font-body-md font-medium transition-all active:scale-95 text-white ${
                  isCameraOn
                    ? 'bg-primary hover:opacity-90'
                    : 'bg-secondary hover:opacity-90'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isCameraOn ? 'videocam_off' : 'videocam'}
                </span>
                {isCameraOn ? 'Stop Camera' : 'Start Camera'}
              </button>
              <div className="flex items-center gap-md">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showBoxes}
                    onChange={(e) => setShowBoxes(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ml-sm font-body-md text-body-md text-on-surface-variant font-medium">
                    Display Bounding Boxes
                  </span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-md text-on-surface-variant font-medium">
              <span className="material-symbols-outlined">settings_ethernet</span>
              <span className="font-data-mono text-data-mono">
                LATENCY: {isAttendanceRunning ? `${latency}ms` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Video Feed Container */}
          <div className="relative flex-1 bg-slate-900 rounded-xl overflow-hidden border border-on-surface/10 shadow-2xl group flex items-center justify-center">
            {/* Viewfinder Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/30 m-md z-20"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/30 m-md z-20"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/30 m-md z-20"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/30 m-md z-20"></div>

            {/* Live Camera Info Overlays */}
            <div className="absolute top-md left-md flex gap-sm z-20">
              <div className="bg-black/40 backdrop-blur-sm px-md py-xs rounded text-white font-data-mono text-[12px] border border-white/10 font-bold">
                CAM_01_RECEPTION
              </div>
              <div className="bg-black/40 backdrop-blur-sm px-md py-xs rounded text-white font-data-mono text-[12px] border border-white/10">
                {new Date().toISOString().slice(0, 10)} {new Date().toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>

            {/* Video stream rendering */}
            {isCameraOn ? (
              <div className="relative w-full h-full aspect-[4/3] max-w-[640px] max-h-[480px] overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Draw CSS Bounding Boxes on Top of Video */}
                {showBoxes &&
                  isAttendanceRunning &&
                  predictions.map((pred, idx) => {
                    const [x_min, y_min, x_max, y_max] = pred.box;
                    // Tọa độ trả về từ camera 640x480. Quy đổi ra %
                    // Vì camera mirror (-scale-x-100), chúng ta cần đảo trục X của box
                    const left = ((640 - x_max) / 640) * 100;
                    const top = (y_min / 480) * 100;
                    const width = ((x_max - x_min) / 640) * 100;
                    const height = ((y_max - y_min) / 480) * 100;

                    const isUnknown = pred.name === 'Unknown';

                    return (
                      <div
                        key={idx}
                        className={`absolute border-2 rounded-lg pointer-events-none z-10 transition-all ${
                          isUnknown
                            ? 'border-error shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                            : 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                        }`}
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                        }}
                      >
                        <div
                          className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-xs backdrop-blur-md px-md py-xs rounded-full border flex items-center gap-xs text-[12px] font-bold text-white whitespace-nowrap ${
                            isUnknown
                              ? 'bg-red-950/80 border-red-500/30'
                              : 'bg-slate-900/80 border-blue-500/30'
                          }`}
                        >
                          <span>{isUnknown ? 'Unknown' : pred.name}</span>
                          <span className={isUnknown ? 'text-error' : 'text-primary'}>
                            {Math.round(pred.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              /* Camera Placeholder Image */
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
                <img
                  className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
                  alt="Camera placeholder feed"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA50Wl3IWVfmWzA9Q854c3s8iKnsS0FGhr1W7JqhjN9g-o9ii45oSc1xqT90g2pnvd36ejDw8NrTvQZMKW3u9f2NK0OTuYv1ybztAWNA0F4tHvfiv_7UuW_Jn7A4eFzfxOSpAWk5UIeT_Z_axakUtfQsaOxr8Yhqes9MTVcdmtyUQyCBjt8MmsnVXdLYQcbbYjgnj6PeOdwQc6z4lfFtccrPFhl0_Z1D-4ePPRcLGmOFgREzqsGhP089CH9DVvdS3UwpCigQ7VTB5U"
                />
                <div className="absolute flex flex-col items-center gap-sm z-10 text-slate-400 font-semibold">
                  <span className="material-symbols-outlined text-4xl">videocam_off</span>
                  <span>Camera Stream Inactive</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live log feed */}
        <div className="flex-1 w-[400px] flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Attendance Log</h3>
            <div className={`flex items-center gap-xs ${isAttendanceRunning ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className={`material-symbols-outlined text-[18px] ${isAttendanceRunning ? 'animate-spin' : ''}`}>sync</span>
              <span className="font-label-caps text-label-caps font-bold">LIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-md space-y-md">
            {attendanceLogs.map((log, idx) => {
              const isUnknown = log.name === 'Unknown Person';
              return (
                <div
                  key={log.id + idx}
                  className={`group relative flex items-center gap-md p-md border-b border-outline-variant/30 rounded-lg transition-all hover:bg-surface-container-low/30 ${
                    idx === 0 && isAttendanceRunning && !isUnknown
                      ? 'bg-secondary-container/30 border-l-4 border-primary'
                      : ''
                  }`}
                >
                  <div className="relative">
                    {isUnknown ? (
                      <div className="w-12 h-12 rounded-full border border-error bg-error/10 flex items-center justify-center text-error">
                        <span className="material-symbols-outlined">person_search</span>
                      </div>
                    ) : (
                      <img
                        alt={`${log.name} avatar`}
                        className={`w-12 h-12 rounded-full object-cover border ${
                          idx === 0 && isAttendanceRunning ? 'border-primary' : 'border-outline-variant'
                        }`}
                        src={log.avatar}
                      />
                    )}
                    {!isUnknown && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-body-md font-bold truncate ${isUnknown ? 'text-error' : 'text-on-surface'}`}>
                        {log.name}
                      </h4>
                      <span
                        className={`font-data-mono text-[11px] px-xs py-[2px] rounded font-bold ${
                          isUnknown
                            ? 'text-on-error bg-error'
                            : 'text-primary bg-primary/10'
                        }`}
                      >
                        {Math.round(log.confidence * 100)}%
                      </span>
                    </div>
                    <p className="font-label-caps text-[11px] text-on-surface-variant font-medium">
                      {log.department}
                    </p>
                    <p className="font-label-caps text-[10px] text-outline mt-xs flex items-center gap-xs font-medium">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {log.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-md bg-surface-container-low border-t border-outline-variant">
            <Link
              href="/attendance/history"
              className="block w-full py-sm bg-surface-container-highest text-on-surface-variant font-label-caps text-label-caps font-bold rounded-lg hover:bg-outline-variant transition-colors text-center text-xs"
            >
              VIEW ALL LOGS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
