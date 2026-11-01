import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, Flashlight, FlashlightOff, HelpCircle, Camera, X } from 'lucide-react';
import shuttle from '../assets/shuttle-city.png';
import '../css/CheckIn.css';

export default function ScanCheckIn({ onBack, onManual, onCheckedIn }) {
  const [help, setHelp] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [torch, setTorch] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!cameraOn) return;
    let cancelled = false;
    let interval;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera is unavailable in this browser.');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
        if ('BarcodeDetector' in window) {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          interval = setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try { const codes = await detector.detect(videoRef.current); if (codes.length) { onCheckedIn(codes[0].rawValue); } } catch (_) {}
          }, 500);
        }
      } catch (err) { setCameraError(err.message || 'Unable to access camera.'); setCameraOn(false); }
    })();
    return () => { cancelled = true; clearInterval(interval); streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; };
  }, [cameraOn, onCheckedIn]);

  const toggleFlash = async () => {
    if (!cameraOn) { setCameraOn(true); setCameraError(''); return; }
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track?.getCapabilities?.().torch) { setCameraError('Flashlight is not available on this device.'); return; }
    try { await track.applyConstraints({ advanced: [{ torch: !torch }] }); setTorch(!torch); }
    catch { setCameraError('Could not switch the flashlight.'); }
  };

  return <section className="checkin-page">
    <header className="checkin-header"><button aria-label="Back" onClick={onBack}><ArrowLeft size={22}/></button><strong>Scan to Check-In</strong></header>
    <div className="checkin-content">
      <p className="checkin-instruction">Scan the QR code on the vehicle to unlock the door</p>
      <button className="checkin-scan-illustration" onClick={() => { setCameraOn(v => !v); setCameraError(''); }} aria-label={cameraOn ? 'Stop camera' : 'Open camera scanner'}>
        {cameraOn ? <><video ref={videoRef} muted playsInline autoPlay/><span className="checkin-scan-frame"/><span className="checkin-camera-caption">Point the camera at the shuttle QR code</span></> : <><img src={shuttle} alt="GrabAi.R autonomous shuttle"/><span className="checkin-qr-board"><span>GrabAi.R</span><FakeQR/><small>Scan to board</small></span><span className="checkin-camera-label"><Camera size={15}/> Tap to scan QR</span></>}
      </button>
      {cameraError && <p className="checkin-camera-error" role="status">{cameraError}</p>}
    </div>
    <div className="checkin-bottom">
      <button className="checkin-outline" onClick={toggleFlash}>{torch ? <FlashlightOff size={17}/> : <Flashlight size={17}/>} {torch ? 'Turn off Flash' : 'Turn on Flash'}</button>
      <button className="checkin-outline help" onClick={() => setHelp(true)}>Need help?</button>
      <button className="checkin-link" onClick={onManual}>Can’t scan the code? <ChevronRight size={12}/></button>
    </div>
    {help && <div className="checkin-overlay" onClick={() => setHelp(false)}><div className="checkin-dialog" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><button className="checkin-close" aria-label="Close" onClick={()=>setHelp(false)}><X/></button><HelpCircle color="#009c55" size={28}/><h2>Need help checking in?</h2><p>Find the QR code beside the shuttle door. Allow camera access and point your phone at the code. If scanning doesn’t work, use the four-digit code displayed on the door.</p><button className="checkin-green" onClick={()=>{setHelp(false);onManual();}}>Enter code instead</button></div></div>}
  </section>;
}
function FakeQR() { return <svg viewBox="0 0 45 45" aria-hidden="true"><rect width="45" height="45" fill="white"/>{Array.from({length:81},(_,i)=>{const x=i%9,y=Math.floor(i/9);const finder=(a,b)=>{const dx=x-a,dy=y-b;return dx>=0&&dx<3&&dy>=0&&dy<3&&(dx===0||dy===0||dx===2||dy===2||(dx===1&&dy===1));};return finder(0,0)||finder(6,0)||finder(0,6)||((x*7+y*13+x*y)%5<2)?<rect key={i} x={x*5} y={y*5} width="5" height="5" fill="#101010"/>:null;})}</svg> }
