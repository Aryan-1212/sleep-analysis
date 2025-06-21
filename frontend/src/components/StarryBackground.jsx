import { useEffect, useRef } from 'react';

const StarryBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stars = [];
    let moon = {
      x: canvas.width * 0.8,
      y: canvas.height * 0.2,
      radius: 40,
      glow: 0
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      stars = [];
      const numberOfStars = Math.floor((canvas.width * canvas.height) / 2000);
      
      for (let i = 0; i < numberOfStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          brightness: Math.random(),
          speed: Math.random() * 0.2
        });
      }
    };

    const drawStars = () => {
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.fill();
        
        star.brightness += star.speed;
        if (star.brightness > 1 || star.brightness < 0) {
          star.speed = -star.speed;
        }
      });
    };

    const drawMoon = () => {
      // Moon glow
      const gradient = ctx.createRadialGradient(
        moon.x, moon.y, 0,
        moon.x, moon.y, moon.radius * 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(moon.x, moon.y, moon.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Moon
      ctx.beginPath();
      ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF';
      ctx.fill();

      // Moon craters
      const craters = [
        { x: -10, y: -5, radius: 8 },
        { x: 10, y: 5, radius: 5 },
        { x: 5, y: -15, radius: 3 }
      ];

      craters.forEach(crater => {
        ctx.beginPath();
        ctx.arc(
          moon.x + crater.x,
          moon.y + crater.y,
          crater.radius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();
      });
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(13, 17, 23, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawStars();
      drawMoon();

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createStars();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createStars();
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: 'linear-gradient(to bottom, #0D1117, #1A1F2C)' }}
    />
  );
};

export default StarryBackground; 