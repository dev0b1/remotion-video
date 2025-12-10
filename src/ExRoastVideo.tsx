// This file previously contained a Remotion component (ExRoastVideo).
// The project has been migrated to a headless ffmpeg + canvas pipeline.
// The original Remotion component was removed to avoid accidental usage.

module.exports = {};

  // Audio
  const audioFile = audioFileName || 'audio/sample.mp3';
  const looksLikeRemote = /^(https?:)?\/\//i.test(audioFile);
  const looksLikeWindowsAbsolute = /^[a-zA-Z]:\\/.test(audioFile);
  const publicRelative = audioFile.replace(/^public\//, '').replace(/^\//, '');
  const resolvedStatic = staticFile(publicRelative);
  const audioSrc = looksLikeRemote || looksLikeWindowsAbsolute ? audioFile : resolvedStatic;

  const audioData = useAudioData(audioSrc);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const visualization = audioData
    ? visualizeAudio({ fps, frame, audioData, numberOfSamples: 256 })
    : new Array(256).fill(0);

  const beatStrength = visualization.reduce((a, b) => a + b, 0) / visualization.length;

  // CANVAS + LASERS + FLASH
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = 540;
    const centerY = 540;
    const innerRadius = 230;

    ctx.clearRect(0, 0, 1080, 1080);
    ctx.globalCompositeOperation = 'lighter';

    // WHITE DROP FLASH
    if (beatStrength > 0.68) {
      ctx.strokeStyle = `rgba(255,255,255,${beatStrength - 0.5})`;
      ctx.lineWidth = 140;
      ctx.shadowBlur = 160;
      ctx.shadowColor = '#fff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius + 100, 0, Math.PI * 2);
      ctx.stroke();
    }

    // RADIAL BARS
    visualization.forEach((value, i) => {
      const angle = (i / 256) * Math.PI * 2 - Math.PI / 2;
      const v = Math.max(0, Math.min(1, value));
      const outLen = v * 520;
      const startX = centerX + Math.cos(angle) * innerRadius;
      const startY = centerY + Math.sin(angle) * innerRadius;
      const outX = centerX + Math.cos(angle) * (innerRadius + outLen);
      const outY = centerY + Math.sin(angle) * (innerRadius + outLen);

      const f = (Math.sin(angle) + 1) / 2;
      const r = Math.round(255 * (1 - f) + 255 * f);
      const g = Math.round(30 * (1 - f) + 150 * f);
      const b = Math.round(255 * (1 - f) + 255 * f);

      ctx.strokeStyle = `rgba(${r},${g},${b},${0.6 + v * 0.4})`;
      ctx.lineWidth = 8 + v * 40;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 50 * v + 20;
      ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(outX, outY);
      ctx.stroke();
    });

    // CARDINAL LASERS
    const pulse = 1 + Math.sin(frame / fps * 2.8) * 0.18;
    const kick = beatStrength > 0.72 ? 1.4 : 1;
    [0, 90, 180, 270].forEach(deg => {
      const angle = (deg * Math.PI) / 180 - Math.PI / 2;
      for (let layer = 0; layer < 6; layer++) {
        const thickness = (6 - layer) * 10 * kick;
        const alpha = (0.9 - layer * 0.13) * beatStrength;
        ctx.strokeStyle = layer < 3 ? `rgba(255, ${layer*70}, 220, ${alpha})` : `rgba(255, 80, 200, ${alpha})`;
        ctx.lineWidth = thickness;
        ctx.shadowBlur = 70 + layer * 20;
        ctx.shadowColor = '#FF0099';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * (innerRadius + 600 * kick + layer * 15) * pulse,
                   centerY + Math.sin(angle) * (innerRadius + 600 * kick + layer * 15) * pulse);
        ctx.stroke();
      }
    });

    // CENTER RING
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10,10,40,0.95)';
    ctx.fill();
    ctx.strokeStyle = '#FF0099';
    ctx.lineWidth = 16;
    ctx.shadowBlur = 80;
    ctx.shadowColor = '#FF0099';
    ctx.stroke();
  }, [visualization, beatStrength, frame, fps]);

  return (
    <AbsoluteFill style={{ background: 'radial-gradient(circle at center, #0F0019 0%, #000 100%)' }}>
      <Audio src={audioSrc} />

      {/* STARS */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        {[...Array(350)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 2 + Math.random()*3,
            height: 2 + Math.random()*3,
            borderRadius: '50%',
            background: '#FFFFFF',
            left: `${Math.random()*100}%`,
            top: `${Math.random()*100}%`,
            opacity: interpolate(Math.sin(frame*0.04 + i), [-1,1], [0.2,0.9]),
            boxShadow: '0 0 12px #fff',
          }} />
        ))}
      </div>

      {/* 0–3s HOOK EXPLOSION */}
      {seconds < 3.3 && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #FF0099 0%, #000 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{
            fontSize: interpolate(seconds, [0,0.7,1.4,2.6], [30,180,140,110], {extrapolateLeft:'clamp'}),
            fontWeight: 900, color: '#FFF', textAlign: 'center', padding: '0 60px', lineHeight: 0.95, letterSpacing: -3,
            textShadow: '0 0 100px #FF00FF, 0 0 200px #FF00FF',
            transform: `scale(${interpolate(Math.sin(seconds*14), [-1,1], [0.92,1.18])})`,
          }}>
            {hookText}
          </div>
          {(seconds > 0.8 && seconds < 1.0 || seconds > 2.0 && seconds < 2.2) && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.9 }} />}
        </div>
      )}

      <canvas ref={canvasRef} width={1080} height={1080} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      {/* CENTER LOGO */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${interpolate(Math.sin(frame/fps*1.4), [-1,1], [0.96,1.18])})`,
        fontSize: 88, fontWeight: 900, color: '#FFFFFF',
        textShadow: '0 0 60px #FF0099, 0 0 120px #FF00FF',
        pointerEvents: 'none',
      }}>
        exroast.buzz
      </div>

      {/* LYRICS — BIG, ALWAYS SHOWS, EMOJIS PERFECT */}
      {seconds > 3.4 && lyrics.map((line: any, i: number) => {
        const nextStart = lyrics[i + 1]?.start || 999;
        const progress = interpolate(seconds, [line.start - 0.4, line.start, nextStart - 0.8, nextStart], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        if (progress < 0.1) return null;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '16%',                     // ← Slightly higher = more visible
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '20px 60px',
              background: 'rgba(20,0,40,0.96)',
              border: '5px solid #FF0099',
              borderRadius: '50px',
              boxShadow: '0 0 90px rgba(255,0,153,0.8)',
              opacity: progress,
              animation: 'popIn 0.5s ease-out both',   // ← Pop-in animation
            }}
          >
            <div style={{
              fontSize: 96,                   // ← BIGGER
              fontWeight: 900,
              color: '#FFFFFF',
              textShadow: '6px 6px 0 #FF0099, 12px 12px 0 #000',
              whiteSpace: 'nowrap',
            }}>
              {line.text}                    // ← Your emojis stay full colour
            </div>
          </div>
        );
      })}

      /* SAVAGE CAPTION — BIGGER + ANIMATED */
      {seconds > 3.4 && (
        <div style={{
          position: 'absolute',
          bottom: 170,                     // ← Clears TikTok bar
          left: '50%',
          padding: '16px 50px',
          background: 'rgba(255,0,153,0.25)',
          border: '4px solid #FF0099',
          borderRadius: '50px',
          animation: 'popIn 0.5s ease-out both',
          transform: `translateX(-50%) scale(${1 + (beatStrength > 0.65 ? Math.sin(frame * 0.6) * 0.08 : 0)})`,
        }}>
          <div style={{
            fontSize: 56,                  // ← MUCH BIGGER
            fontWeight: 900,
            color: '#FFFFFF',
            textShadow: '4px 4px 0 #FF0099',
          }}>
            {[
              "This AI is TOO petty",
              "He’s crying in the DMs",
              "Tag your toxic ex",
              "Karma used AI",
              "Ex just got cooked",
              "Therapist = cancelled"
            ][Math.floor(seconds / 7.5) % 6]}
          </div>
        </div>
      )}

      {/* WATERMARK */}
      <div style={{ position: 'absolute', top: 70, right: 40, fontSize: 34, color: '#00D9FF', fontWeight: 'bold', textShadow: '0 0 20px #00D9FF', opacity: 0.9 }}>
        exroast.buzz
      </div>
    </AbsoluteFill>
  );
};

// Ex-Remotion component removed.

/* ADD THIS ONCE IN YOUR PROJECT (global CSS or <style> tag) */
try {
  if (typeof document !== 'undefined' && !document.getElementById('exroast-popin-style')) {
    const style = document.createElement('style');
    style.id = 'exroast-popin-style';
    style.innerHTML = `
    @keyframes popIn {
      0%   { transform: translateX(-50%) scale(0.3); opacity: 0; }
      70%  { transform: translateX(-50%) scale(1.12); }
      100% { transform: translateX(-50%) scale(1); opacity: 1; }
    }`;
    document.head.appendChild(style);
  }
} catch (e) {
  // ignore server-side or build-time DOM errors
}