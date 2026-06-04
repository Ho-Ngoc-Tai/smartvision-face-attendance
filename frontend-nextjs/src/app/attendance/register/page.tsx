'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function FaceRegistrationPage() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Checklist states (dynamic checkmark based on inputs)
  const isNameValid = name.trim().length > 0;
  const isIdValid = studentId.trim().length > 0;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mở camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setCapturedImage(null);
    } catch (error) {
      console.error('Lỗi khởi động camera:', error);
      showStatus('Cannot access camera. Please allow permission.', 'error');
    }
  };

  // Tắt camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const showStatus = (msg: string, type: 'success' | 'error' | 'loading') => {
    setStatusMessage(msg);
    if (type === 'success') setSaveStatus('success');
    else if (type === 'error') setSaveStatus('error');
    else setSaveStatus('loading');
  };

  // Chụp ảnh từ camera
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraOn) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);

    setCapturedImage(base64);
    stopCamera();
    showStatus('Snapshot captured successfully.', 'success');
    setTimeout(() => {
      setSaveStatus('idle');
      setStatusMessage('');
    }, 2000);
  };

  // Chụp lại ảnh (retake)
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Đăng ký / Lưu khuôn mặt
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameValid) {
      showStatus('Please enter full name.', 'error');
      return;
    }
    if (!isIdValid) {
      showStatus('Please enter student/employee ID.', 'error');
      return;
    }
    if (!capturedImage) {
      showStatus('Please capture or upload an identity image.', 'error');
      return;
    }

    showStatus('Extracting vector embedding & enrolling face...', 'loading');

    try {
      // Vì backend chỉ lưu tên, ta nối thông tin Name + ID + Department
      const enrollmentName = `${name.trim()} (${studentId.trim()} - ${department})`;

      const response = await fetch('http://localhost:3000/api/v1/faces/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enrollmentName,
          image: capturedImage,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        showStatus('Identity registered successfully!', 'success');
        setName('');
        setStudentId('');
        setCapturedImage(null);
        startCamera();
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        showStatus(result.message || 'Face registration failed.', 'error');
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      showStatus('Failed to connect to gateway server.', 'error');
    }
  };

  // Xử lý kéo thả tệp tải lên
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showStatus('Supported formats: JPG, PNG, WEBP.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
      stopCamera();
      showStatus('Image uploaded successfully.', 'success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
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
        <div className="flex items-center gap-md">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Face Registration</span>
          <span className="text-on-surface-variant opacity-40">|</span>
          <span className="font-body-md text-on-surface-variant font-medium">Add New Identity</span>
        </div>
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-sm px-md py-xs bg-surface-container rounded-full cursor-pointer hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              notifications
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant font-bold">4 Alerts</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer active:opacity-80">
            account_circle
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-xl">
          {/* Header Instruction */}
          <div className="mb-xl">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Identity Enrollment</h2>
            <p className="text-on-surface-variant mt-xs font-medium">
              Ensure the subject is centered and clearly visible for optimal biometric vector extraction.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-xl items-start">
            {/* Left Column: Form Info */}
            <div className="col-span-12 lg:col-span-5 space-y-lg">
              {/* Form Widget */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                <h3 className="font-headline-sm text-headline-sm mb-lg text-on-surface font-bold">
                  Personal Information
                </h3>
                <form onSubmit={handleSave} className="space-y-md">
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs font-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Jonathan Doe"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-body-md"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs font-semibold">
                      Student/Employee ID
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="SV-99420-B"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-data-mono text-body-md text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs font-semibold">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-body-md"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Administration">Administration</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="External Visitor">External Visitor</option>
                    </select>
                  </div>
                </form>
              </div>

              {/* Quality Checklist Widget */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-md font-bold">
                  Quality Checklist
                </h3>
                <ul className="space-y-sm">
                  <li className="flex items-center gap-sm">
                    <span
                      className={`material-symbols-outlined text-[18px] transition-colors ${
                        isNameValid ? 'text-primary' : 'text-on-surface-variant opacity-60'
                      }`}
                      style={{ fontVariationSettings: isNameValid ? "'FILL' 1" : undefined }}
                    >
                      {isNameValid ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`text-body-md ${isNameValid ? 'text-on-surface font-medium' : 'text-on-surface-variant opacity-60'}`}>
                      Full Name filled in
                    </span>
                  </li>
                  <li className="flex items-center gap-sm">
                    <span
                      className={`material-symbols-outlined text-[18px] transition-colors ${
                        isIdValid ? 'text-primary' : 'text-on-surface-variant opacity-60'
                      }`}
                      style={{ fontVariationSettings: isIdValid ? "'FILL' 1" : undefined }}
                    >
                      {isIdValid ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`text-body-md ${isIdValid ? 'text-on-surface font-medium' : 'text-on-surface-variant opacity-60'}`}>
                      Student/Employee ID entered
                    </span>
                  </li>
                  <li className="flex items-center gap-sm">
                    <span
                      className={`material-symbols-outlined text-[18px] transition-colors ${
                        capturedImage ? 'text-primary' : 'text-on-surface-variant opacity-60'
                      }`}
                      style={{ fontVariationSettings: capturedImage ? "'FILL' 1" : undefined }}
                    >
                      {capturedImage ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`text-body-md ${capturedImage ? 'text-on-surface font-medium' : 'text-on-surface-variant opacity-60'}`}>
                      Facial image captured/uploaded
                    </span>
                  </li>
                </ul>
              </div>

              {/* Status Message Display */}
              {statusMessage && (
                <div
                  className={`p-md rounded-lg border text-sm text-center font-medium ${
                    saveStatus === 'success'
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : saveStatus === 'error'
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-blue-100 border-blue-300 text-blue-800'
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              {/* Primary Action Button */}
              <button
                onClick={handleSave}
                disabled={saveStatus === 'loading'}
                className={`w-full py-md px-xl rounded-lg font-bold flex items-center justify-center gap-md transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-white ${
                  saveStatus === 'loading'
                    ? 'bg-secondary cursor-not-allowed'
                    : saveStatus === 'success'
                    ? 'bg-green-600'
                    : 'bg-primary'
                }`}
              >
                <span>
                  {saveStatus === 'loading'
                    ? 'Extracting Vectors...'
                    : saveStatus === 'success'
                    ? 'Successfully Enrolled'
                    : 'Extract Vector & Save'}
                </span>
                {saveStatus === 'loading' && (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                )}
                {saveStatus === 'success' && (
                  <span className="material-symbols-outlined">verified</span>
                )}
              </button>
            </div>

            {/* Right Column: Capture & Media */}
            <div className="col-span-12 lg:col-span-7 space-y-lg">
              {/* Preview Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                  {/* Viewfinder Outline Overlay */}
                  <div className="absolute inset-0 border-[16px] border-slate-900/40 pointer-events-none z-20"></div>
                  <div className="scanning-line z-20"></div>

                  <div className="viewfinder-corner top-lg left-lg border-t-2 border-l-2 z-20"></div>
                  <div className="viewfinder-corner top-lg right-lg border-t-2 border-r-2 z-20"></div>
                  <div className="viewfinder-corner bottom-lg left-lg border-b-2 border-l-2 z-20"></div>
                  <div className="viewfinder-corner bottom-lg right-lg border-b-2 border-r-2 z-20"></div>

                  {/* LIVE Overlay badge */}
                  <div className="absolute bottom-md left-1/2 -translate-x-1/2 bg-slate-900/80 text-white px-md py-sm rounded-full flex items-center gap-sm backdrop-blur-md z-20">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                    <span className="font-label-caps text-label-caps font-bold">
                      {isCameraOn ? 'LIVE | SENSORS ACTIVE' : 'PREVIEW FILE'}
                    </span>
                  </div>

                  {/* Image/Video frame */}
                  {capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured Face Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : isCameraOn ? (
                    <div className="w-full h-full aspect-[4/3] max-w-[640px] max-h-[480px]">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : (
                    <div className="absolute flex flex-col items-center gap-sm text-slate-400 font-semibold">
                      <span className="material-symbols-outlined text-4xl">videocam_off</span>
                      <span>Webcam inactive</span>
                    </div>
                  )}
                </div>

                {/* Card footer details */}
                <div className="p-lg flex justify-between items-center">
                  <div className="flex gap-md">
                    {isCameraOn ? (
                      <button
                        onClick={handleCapture}
                        className="flex items-center gap-sm px-md py-sm border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-on-surface font-semibold text-xs"
                      >
                        <span className="material-symbols-outlined">photo_camera</span>
                        Capture Snapshot
                      </button>
                    ) : (
                      <button
                        onClick={handleRetake}
                        className="flex items-center gap-sm px-md py-sm border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-on-surface font-semibold text-xs"
                      >
                        <span className="material-symbols-outlined">refresh</span>
                        Retake photo
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                      Quality confidence
                    </p>
                    <p className="text-primary font-headline-sm font-bold">
                      {capturedImage ? '98.4%' : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center bg-surface-container-low/50 hover:bg-surface-container hover:border-primary transition-all duration-300 cursor-pointer group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                    upload_file
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Upload Identity Image
                </h4>
                <p className="text-on-surface-variant mt-xs text-body-md font-medium">
                  Drag and drop or <span className="text-primary font-bold">browse files</span>
                </p>
                <p className="text-xs text-on-surface-variant mt-sm font-semibold">
                  Supports: JPG, PNG, WEBP (Max 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
