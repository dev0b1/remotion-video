function drawPopupText(ctx, textEvents = [], currentTime = 0, opts = {}) {
  if (!Array.isArray(textEvents) || textEvents.length === 0) return;

  // find events that are active at this time
  const active = textEvents.filter((e) => currentTime >= e.start && currentTime <= e.end);
  if (active.length === 0) return;

  ctx.save();
  active.forEach((event) => {
    const duration = Math.max(0.001, event.end - event.start);
    const progress = Math.max(0, Math.min(1, (currentTime - event.start) / duration));
    // simple ease-in-out
    const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
    const alpha = Math.min(1, ease * (event.fadeIn || 1));
    const scale = 0.6 + 0.4 * ease;

    const fontSize = event.fontSize || Math.floor((opts.fontScale || 0.06) * (opts.height || 1080));
    const x = (typeof event.x !== 'undefined') ? event.x : (opts.width || 1080) / 2;
    const y = (typeof event.y !== 'undefined') ? event.y : (opts.height || 1080) - Math.floor((opts.height || 1080) * 0.12);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = event.color || '#ffffff';
    ctx.font = `bold ${fontSize}px ${event.font || 'sans-serif'}`;
    // draw subtle shadow
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    ctx.fillText(event.text || '', 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

module.exports = { drawPopupText };
