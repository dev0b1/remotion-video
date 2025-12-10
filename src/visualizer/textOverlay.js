// Draw a single popup text event (scale + fade animation) onto the canvas 2D context
function drawPopupText(ctx, textEvents, currentTime, opts = {}) {
  const event = textEvents.find((e) => currentTime >= e.start && currentTime <= e.end);
  if (!event) return;

  const progress = (currentTime - event.start) / Math.max(0.0001, event.end - event.start);
  // ease in/out
  const ease = Math.sin(progress * Math.PI);

  ctx.save();
  ctx.globalAlpha = ease;
  ctx.fillStyle = event.color || opts.color || '#FFFFFF';
  ctx.textAlign = 'center';
  const fontSize = event.fontSize || opts.fontSize || 48;
  const fontFamily = event.fontFamily || opts.fontFamily || 'Arial';
  ctx.font = `bold ${fontSize}px ${fontFamily}`;

  const x = event.x || opts.x || Math.floor(ctx.canvas.width / 2);
  const y = event.y || opts.y || Math.floor(ctx.canvas.height - 80);

  // pop scale effect
  const scale = 0.5 + ease * 1.0;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillText(event.text, 0, 0);
  ctx.restore();
}

module.exports = { drawPopupText };
