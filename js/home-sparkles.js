
  (function () {
    var preference=matchMedia('(prefers-reduced-motion: reduce)');
    var pointer=matchMedia('(hover: hover) and (pointer: fine)');
    var reduce=preference.matches, enabled=false, animation=0;
    var canvas = document.getElementById('home-dust');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if(!ctx)return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // "Diana C" coral, with a couple of lighter sparkle tints for the dust
    var TINTS = [ [250, 207, 216], [253, 228, 233], [250, 232, 203] ];
    function makeSprite(rgb) {
      var s = 64, c = document.createElement('canvas'); c.width = c.height = s;
      var g = c.getContext('2d');
      var grad = g.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
      grad.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',1)');
      grad.addColorStop(0.4, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.55)');
      grad.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
      g.fillStyle = grad; g.fillRect(0, 0, s, s);
      return c;
    }
    var sprites = TINTS.map(makeSprite);
    var glowSprite = makeSprite([248, 192, 204]);

    var parts = [];
    var MAX = 40;
    // Fast movement stretches the spring chain; slowing lets it curl and settle.
    var LINE = {count:10, stiffness:260, damping:24, width:1.25, color:'#D8576C'};
    var trail = [];
    var mx = -999, my = -999, hasMouse = false;
    var lastX = -999, lastY = -999;
    var gx = -999, gy = -999;   // smoothed glow position (trails the cursor)

    function spawn(x, y, n) {
      for (var i = 0; i < n; i++) {
        if (parts.length >= MAX) break;
        var a = Math.random() * Math.PI * 2;
        var sp = Math.random() * 0.35;
        parts.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 0.18,         // slight upward float, like dust
          life: 0, max: 0.9 + Math.random() * 0.9,  // ~1–1.8s
          size: 3 + Math.random() * 5,
          spin: Math.random() * 6.28,
          tint: Math.random() < 0.78 ? 0 : (Math.random() < 0.6 ? 1 : 2)
        });
      }
    }

    function onMove(e) {
      if(!enabled || e.pointerType==='touch')return;
      wake();
      mx = e.clientX; my = e.clientY; hasMouse = true;
      if(!trail.length) {
        for(var j=0;j<LINE.count;j++)trail.push({x:mx,y:my,vx:0,vy:0});
      }
      if (gx < -900) { gx = mx; gy = my; }
      if (reduce) return;
      if (lastX < -900) { lastX = mx; lastY = my; }
      var dx = mx - lastX, dy = my - lastY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var step = 32;
      if (dist >= step) {
        var n = Math.min(Math.floor(dist / step), 2);
        for (var i = 1; i <= n; i++) {
          spawn(lastX + dx * (i / n), lastY + dy * (i / n), 1);
        }
        lastX = mx; lastY = my;
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', function (e) { if (!e.relatedTarget) { hasMouse = false;trail=[];lastX=lastY=gx=gy=-999;wake(); } });

    var last = performance.now();
    function wake() {
      if(enabled&&!animation) { last=performance.now();animation=requestAnimationFrame(frame); }
    }
    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.clearRect(0, 0, W, H);

      // soft glow that lags slightly behind the cursor
      if (hasMouse) {
        gx += (mx - gx) * 0.16; gy += (my - gy) * 0.16;
        var gr = 150;
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.16;
        ctx.drawImage(glowSprite, gx - gr, gy - gr, gr * 2, gr * 2);
      }

      // Integrate in small steps so the spring feels consistent at any frame rate.
      var lineMoving=false, remaining=dt;
      while(remaining>0 && trail.length) {
        var h=Math.min(remaining,1/120);remaining-=h;
        for(var t=0;t<trail.length;t++) {
          var point=trail[t], leader=t?trail[t-1]:{x:mx,y:my};
          point.vx+=(LINE.stiffness*(leader.x-point.x)-LINE.damping*point.vx)*h;
          point.vy+=(LINE.stiffness*(leader.y-point.y)-LINE.damping*point.vy)*h;
          point.x+=point.vx*h;point.y+=point.vy*h;
        }
      }
      for(var t=0;t<trail.length;t++) {
        var point=trail[t];
        if(Math.hypot(point.x-mx,point.y-my)>.2 || Math.hypot(point.vx,point.vy)>1)lineMoving=true;
      }
      if(hasMouse && lineMoving) {
        ctx.globalAlpha=1;
        ctx.strokeStyle=LINE.color;
        ctx.lineWidth=LINE.width;
        ctx.lineCap='round';ctx.lineJoin='round';
        ctx.beginPath();ctx.moveTo(mx,my);
        for(var t=0;t<trail.length-1;t++) {
          var point=trail[t], next=trail[t+1];
          ctx.quadraticCurveTo(point.x,point.y,(point.x+next.x)/2,(point.y+next.y)/2);
        }
        var tail=trail[trail.length-1];
        ctx.lineTo(tail.x,tail.y);ctx.stroke();
      }

      // pixie dust
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.life += dt;
        if (p.life >= p.max) { parts.splice(i, 1); continue; }
        p.vx *= 0.96; p.vy = p.vy * 0.96 - 0.02 * dt; // gentle continued float
        p.x += p.vx; p.y += p.vy;
        var r = 1 - p.life / p.max;
        var alpha = Math.sin(r * Math.PI) * 0.65;       // fade in fast, out slow
        var tw = 0.75 + 0.25 * Math.sin(now * 0.012 + p.spin); // soft twinkle
        var sz = p.size * (0.35 + 0.65 * r);
        ctx.globalAlpha = Math.max(0, alpha * tw);
        ctx.drawImage(sprites[p.tint], p.x - sz, p.y - sz, sz * 2, sz * 2);
      }
      ctx.globalAlpha = 1;
      var glowMoving=hasMouse&&(Math.abs(mx-gx)>.1||Math.abs(my-gy)>.1);
      animation=enabled&&(parts.length||(hasMouse&&lineMoving)||glowMoving)?requestAnimationFrame(frame):0;
    }
    function sync() {
      reduce=preference.matches;
      var next=!reduce && pointer.matches && !document.hidden && document.documentElement.dataset.introCompact!=='true';
      if(next===enabled)return;
      enabled=next;
      if(enabled) { /* Wait for pointer movement before drawing. */ }
      else { cancelAnimationFrame(animation);animation=0;parts=[];trail=[];hasMouse=false;lastX=lastY=gx=gy=-999;ctx.clearRect(0,0,W,H); }
    }
    document.addEventListener('portfolio:intro-state',sync);
    document.addEventListener('visibilitychange',sync);
    preference.addEventListener('change',sync);
    pointer.addEventListener('change',sync);
    sync();
  })();
  