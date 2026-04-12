import { useEffect, useRef } from 'react';

function getParticleConfig(code, dark) {
  const h = new Date().getHours();
  const isNight = h < 6 || h >= 20;

  // Rain
  if ([51,53,55,61,63,65,80,81,82].includes(code)) {
    const heavy = [65,82].includes(code);
    return {
      type: 'rain',
      count: heavy ? 120 : 60,
      color: dark ? 'rgba(96,165,250,' : 'rgba(59,130,246,',
      opacity: heavy ? 0.55 : 0.35,
      speed: heavy ? 14 : 8,
      width: heavy ? 1.5 : 1,
      height: heavy ? 18 : 12,
      wind: heavy ? 2 : 0.8,
    };
  }
  // Snow
  if ([71,73,75,77,85,86].includes(code)) {
    return {
      type: 'snow',
      count: 60,
      color: dark ? 'rgba(224,242,254,' : 'rgba(186,230,253,',
      opacity: 0.7,
      speed: 1.5,
      size: 3,
    };
  }
  // Thunderstorm
  if ([95,96,99].includes(code)) {
    return {
      type: 'rain',
      count: 150,
      color: dark ? 'rgba(139,92,246,' : 'rgba(109,40,217,',
      opacity: 0.45,
      speed: 18,
      width: 1.5,
      height: 20,
      wind: 3,
    };
  }
  // Clear night → stars
  if (isNight && [0,1].includes(code)) {
    return {
      type: 'stars',
      count: 80,
      color: 'rgba(255,255,255,',
      opacity: 0.8,
    };
  }
  // Clear day → shimmer dust
  if ([0,1].includes(code)) {
    return {
      type: 'dust',
      count: 30,
      color: dark ? 'rgba(251,191,36,' : 'rgba(245,158,11,',
      opacity: 0.25,
      speed: 0.3,
      size: 2,
    };
  }
  return null; // no particles for other conditions
}

export default function WeatherCanvas({ weatherCode, dark }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const config = getParticleConfig(weatherCode, dark);

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    if (!config) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }

    // Build particles
    let particles = [];

    if (config.type === 'rain') {
      for (let i = 0; i < config.count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: config.speed + Math.random() * 4,
          wind:  config.wind  + Math.random() * 1,
          opacity: config.opacity * (0.5 + Math.random() * 0.5),
        });
      }
    } else if (config.type === 'snow') {
      for (let i = 0; i < config.count; i++) {
        particles.push({
          x:       Math.random() * canvas.width,
          y:       Math.random() * canvas.height,
          r:       config.size * (0.5 + Math.random()),
          speed:   config.speed * (0.5 + Math.random()),
          drift:   (Math.random() - 0.5) * 0.8,
          opacity: config.opacity * (0.5 + Math.random() * 0.5),
          wobble:  Math.random() * Math.PI * 2,
        });
      }
    } else if (config.type === 'stars') {
      for (let i = 0; i < config.count; i++) {
        particles.push({
          x:       Math.random() * canvas.width,
          y:       Math.random() * canvas.height,
          r:       0.5 + Math.random() * 1.5,
          opacity: config.opacity * (0.3 + Math.random() * 0.7),
          twinkle: Math.random() * Math.PI * 2,
          speed:   0.02 + Math.random() * 0.03,
        });
      }
    } else if (config.type === 'dust') {
      for (let i = 0; i < config.count; i++) {
        particles.push({
          x:       Math.random() * canvas.width,
          y:       Math.random() * canvas.height,
          r:       config.size * (0.5 + Math.random()),
          dx:      (Math.random() - 0.5) * config.speed,
          dy:      (Math.random() - 0.5) * config.speed,
          opacity: config.opacity * (0.4 + Math.random() * 0.6),
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        if (config.type === 'rain') {
          ctx.save();
          ctx.strokeStyle = config.color + p.opacity + ')';
          ctx.lineWidth   = config.width;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + config.wind * 2, p.y + config.height);
          ctx.stroke();
          ctx.restore();
          // Move
          p.x += p.wind;
          p.y += p.speed;
          if (p.y > canvas.height) { p.y = -config.height; p.x = Math.random() * canvas.width; }
          if (p.x > canvas.width)  { p.x = 0; }

        } else if (config.type === 'snow') {
          p.wobble += 0.03;
          ctx.save();
          ctx.fillStyle = config.color + p.opacity + ')';
          ctx.beginPath();
          ctx.arc(p.x + Math.sin(p.wobble) * 2, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          p.y += p.speed;
          p.x += p.drift;
          if (p.y > canvas.height) { p.y = -p.r; p.x = Math.random() * canvas.width; }
          if (p.x > canvas.width)  p.x = 0;
          if (p.x < 0)             p.x = canvas.width;

        } else if (config.type === 'stars') {
          p.twinkle += p.speed;
          const op = p.opacity * (0.5 + 0.5 * Math.sin(p.twinkle));
          ctx.save();
          ctx.fillStyle = config.color + op + ')';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

        } else if (config.type === 'dust') {
          ctx.save();
          ctx.fillStyle = config.color + p.opacity + ')';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          p.x += p.dx;
          p.y += p.dy;
          if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [weatherCode, dark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  );
}
