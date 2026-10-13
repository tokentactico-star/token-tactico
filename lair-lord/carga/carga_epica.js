// carga_epica.js — la PORTADA ÉPICA mientras se descarga el juego (ver carga_epica.css). Monta encima de la imagen de
// arranque las luces, los rayos y las brasas, marca el ritmo de la pelea (un latido cada GOLPE s y un GOLPAZO cada
// GOLPAZO golpes: destello, onda, temblor y fogonazo) y pone el sonido: la música del menú, un rugido al empezar y un
// trueno en cada golpazo. Los navegadores no dejan sonar nada hasta que se toca la pantalla, así que si no suena solo,
// sale «Toca para oír la batalla». Cuando Godot quita la pantalla de carga (#status), todo se va con ella y la música
// se apaga poco a poco. Las posiciones van en fracción de la imagen (720×1280).
(function () {
	'use strict';
	var RUTA = 'carga/';
	var ASPECTO = 720 / 1280;
	var GOLPE = 0.6, GOLPAZO = 4;
	var CHOQUE = [0.60, 0.642], PUNO = [0.18, 0.676], ESPADA = [0.74, 0.64], ARRIBA = [0.99, 0.30];
	var ANTORCHAS = [[0.072, 0.37], [0.278, 0.325], [0.732, 0.325]];
	var BRASAS = 34;

	function crea(tipo, clase, padre, estilo) {
		var e = document.createElement(tipo);
		if (clase) e.className = clase;
		if (estilo) for (var k in estilo) e.style[k] = estilo[k];
		padre.appendChild(e);
		return e;
	}
	function luz(padre, f, ancho, color, extra) {
		var e = crea('div', 'epica-luz', padre, {
			left: f[0] * 100 + '%', top: f[1] * 100 + '%', width: ancho * 100 + '%', aspectRatio: '1',
			background: 'radial-gradient(circle, ' + color + ')'
		});
		if (extra) for (var k in extra) e.style[k] = extra[k];
		return e;
	}

	function montar() {
		var status = document.getElementById('status');
		if (!status || document.getElementById('epica')) return;
		var caja = crea('div', '', status); caja.id = 'epica';
		var zum = crea('div', '', caja); zum.id = 'epica-zum';
		var tiembla = crea('div', '', zum); tiembla.id = 'epica-tiembla';
		var fondo = crea('img', 'epica-fondo', tiembla); fondo.src = 'index.png'; fondo.alt = '';

		// la lava y el trono respiran; las antorchas titilan
		luz(tiembla, [0.55, 0.49], 0.75, 'rgba(255,90,20,.55) 0, rgba(255,60,10,.0) 65%',
			{ aspectRatio: '2.4', animation: 'epica-respira 2.6s ease-in-out infinite alternate' });
		luz(tiembla, [0.45, 0.93], 1.1, 'rgba(255,70,20,.45) 0, rgba(255,40,0,0) 65%',
			{ aspectRatio: '3', animation: 'epica-respira 3.4s .8s ease-in-out infinite alternate' });
		luz(tiembla, [0.495, 0.335], 0.07, 'rgba(255,40,30,.95) 0, rgba(255,0,0,0) 70%',
			{ animation: 'epica-respira 1.1s ease-in-out infinite alternate' });
		ANTORCHAS.forEach(function (f, i) {
			luz(tiembla, f, 0.2, 'rgba(255,170,60,.85) 0, rgba(255,90,20,.35) 35%, rgba(255,60,0,0) 70%',
				{ animation: 'epica-antorcha ' + (0.9 + i * 0.23) + 's ' + (i * 0.31) + 's linear infinite' });
		});
		// el puño de Gormak y la espada de Aldric cargan su magia
		var puno = luz(tiembla, PUNO, 0.34, 'rgba(255,60,30,.95) 0, rgba(255,30,10,.45) 30%, rgba(255,0,0,0) 68%');
		var espada = luz(tiembla, ESPADA, 0.26, 'rgba(255,240,170,.95) 0, rgba(255,200,80,.45) 30%, rgba(255,180,0,0) 68%');
		// los rayos vivos, del origen al choque
		var rayos = [
			{ de: PUNO, color: 'rojo', ancho: 0.2, fase: 0 },
			{ de: ESPADA, color: 'oro', ancho: 0.18, fase: 1 },
			{ de: ARRIBA, color: 'oro', ancho: 0.16, fase: 2 }
		].map(function (r) { r.e = crea('div', 'epica-rayo', tiembla); return r; });
		// el choque: halo, destello que gira y la onda de cada golpe
		var halo = luz(tiembla, CHOQUE, 0.62, 'rgba(255,255,235,1) 0, rgba(255,215,110,.75) 18%, rgba(255,110,40,.28) 42%, rgba(255,60,0,0) 70%');
		var destello = crea('img', 'epica-img', tiembla, { left: CHOQUE[0] * 100 + '%', top: CHOQUE[1] * 100 + '%' });
		destello.src = RUTA + 'destello.png';
		var onda = crea('img', 'epica-img', tiembla, { left: CHOQUE[0] * 100 + '%', top: CHOQUE[1] * 100 + '%', opacity: 0 });
		onda.src = RUTA + 'onda.png';
		// brasas que suben
		for (var i = 0; i < BRASAS; i++) {
			crea('div', 'epica-brasa', tiembla, {
				left: (Math.random() * 100) + '%', top: (60 + Math.random() * 45) + '%',
				animationDuration: (5 + Math.random() * 6) + 's', animationDelay: (-Math.random() * 10) + 's',
				width: (1.2 + Math.random() * 2.2) + '%'
			}).style.setProperty('--vaiven', ((Math.random() - 0.5) * 12) + 'vw');
		}
		crea('div', '', tiembla).id = 'epica-brillo';           // un brillo que cruza el título
		var flash = crea('div', '', zum); flash.id = 'epica-flash';
		var vineta = crea('div', '', caja); vineta.id = 'epica-vineta';      // los bordes se encienden de rojo en cada golpazo
		var aviso = crea('div', '', caja); aviso.id = 'epica-sonido'; aviso.textContent = '🔊 Toca para oír la batalla';

		function encaja() {                                     // la caja de la imagen (contain, centrada)
			var w = status.clientWidth, h = status.clientHeight;
			var cw = Math.min(w, h * ASPECTO), ch = cw / ASPECTO;
			caja.style.left = (w - cw) / 2 + 'px'; caja.style.top = (h - ch) / 2 + 'px';
			caja.style.width = cw + 'px'; caja.style.height = ch + 'px';
			rayos.forEach(function (r) {
				var x0 = r.de[0] * cw, y0 = r.de[1] * ch, x1 = CHOQUE[0] * cw, y1 = CHOQUE[1] * ch;
				var dx = x1 - x0, dy = y1 - y0, largo = Math.sqrt(dx * dx + dy * dy);
				var ang = Math.atan2(dy, dx) * 180 / Math.PI - 90;
				var a = r.ancho * cw;
				r.e.style.left = (x0 - a / 2) + 'px'; r.e.style.top = y0 + 'px';
				r.e.style.width = a + 'px'; r.e.style.height = largo + 'px';
				r.e.style.transform = 'rotate(' + ang + 'deg)';
			});
		}
		encaja();
		window.addEventListener('resize', encaja);

		// ── el sonido ──
		var ctx = null, sonidos = {}, master = null, musica = null, sonando = false;
		function carga(nombre) {
			return fetch(RUTA + nombre + '.ogg').then(function (r) { return r.arrayBuffer(); })
				.then(function (b) { return new Promise(function (ok, mal) { ctx.decodeAudioData(b, ok, mal); }); })
				.then(function (buf) { sonidos[nombre] = buf; return buf; })
				.catch(function () { return null; });
		}
		function suena(nombre, vol, ritmo) {
			if (!sonando || !sonidos[nombre]) return null;
			var s = ctx.createBufferSource(), g = ctx.createGain();
			s.buffer = sonidos[nombre]; s.playbackRate.value = ritmo || 1;
			g.gain.value = vol; s.connect(g); g.connect(master); s.start();
			return s;
		}
		function arranca() {
			if (sonando) return;
			try {
				if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
				ctx.resume();
			} catch (e) { return; }
			if (ctx.state !== 'running') {
				ctx.resume().then(function () { if (ctx.state === 'running') arranca(); });
				return;
			}
			sonando = true;
			aviso.classList.add('fuera');
			master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
			carga('jefe').then(function () { suena('jefe', 0.8, 0.85); });
			carga('golpe_fuerte'); carga('rayo');
			carga('menu').then(function (buf) {
				if (!buf || !document.body.contains(status)) return;
				musica = ctx.createBufferSource(); musica.buffer = buf; musica.loop = true;
				var g = ctx.createGain(); musica.connect(g); g.connect(master);
				g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.5);
				musica.start();
			});
		}
		try {                                                   // si el navegador ya deja sonar, suena solo
			ctx = new (window.AudioContext || window.webkitAudioContext)();
			if (ctx.state === 'running') arranca();
		} catch (e) { ctx = null; }
		['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (ev) {
			document.addEventListener(ev, arranca, { capture: true, passive: true });
		});

		// ── el ritmo de la pelea ──
		var t0 = performance.now(), ultimo = -1, cuadro = -1, fin = false;
		function golpazo(n) {
			flash.animate([{ opacity: 0.8 }, { opacity: 0 }], { duration: 380, easing: 'ease-out' });
			var k = [];
			for (var i = 0; i < 7; i++) k.push({ transform: 'translate(' + ((Math.random() - 0.5) * 2.4) + '%,' + ((Math.random() - 0.5) * 1.8) + '%) scale(' + (1.05 - i * 0.007) + ')' });
			k.push({ transform: 'translate(0,0)' });
			tiembla.animate(k, { duration: 300, easing: 'linear' });
			fondo.animate([{ filter: 'brightness(1.55) saturate(1.35)' }, { filter: 'none' }], { duration: 450, easing: 'ease-out' });
			vineta.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: 900, easing: 'ease-out', fill: 'forwards' });
			suena('golpe_fuerte', 0.7, 0.9 + Math.random() * 0.2);
			if (n % 2 === 0) suena('rayo', 0.45, 0.9 + Math.random() * 0.2);
		}
		function paso(ahora) {
			if (!document.body.contains(status)) {              // Godot quitó la carga: se apaga la música
				if (!fin && sonando) {
					fin = true;
					master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
					master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
					setTimeout(function () { try { ctx.close(); } catch (e) {} }, 1500);
				}
				return;
			}
			var t = (ahora - t0) / 1000;
			var entra = Math.min(1, t / 1.4);
			var n = Math.floor(t / GOLPE), u = (t % GOLPE) / GOLPE;
			var fuerte = Math.max(0, 1 - u * 4);
			var gordo = (n % GOLPAZO === 0) ? 1 : 0.45;
			if (n !== ultimo && t > 1.0) {
				ultimo = n;
				if (n % GOLPAZO === 0) golpazo(n / GOLPAZO);
				else suena('golpe_fuerte', 0.22, 1.3 + Math.random() * 0.2);
			}
			var f = fuerte * gordo;
			halo.style.opacity = entra * (0.55 + 0.45 * f);
			halo.style.transform = 'translate(-50%,-50%) scale(' + (1 + 0.1 * Math.sin(t * 9) + 0.35 * f) + ')';
			destello.style.width = (42 * (1 + 0.12 * Math.sin(t * 9) + 0.4 * f)) + '%';
			destello.style.opacity = entra;
			destello.style.transform = 'translate(-50%,-50%) rotate(' + (t * 25) + 'deg)';
			if (u < 0.6) {
				var o = u / 0.6;
				onda.style.width = ((15 + 75 * o) * (gordo > 0.5 ? 1.3 : 0.8)) + '%';
				onda.style.opacity = entra * (1 - o) * (gordo > 0.5 ? 1 : 0.5);
			} else onda.style.opacity = 0;
			puno.style.opacity = entra * (0.45 + 0.25 * Math.sin(t * 6) + 0.4 * f);
			puno.style.transform = 'translate(-50%,-50%) scale(' + (1 + 0.08 * Math.sin(t * 6) + 0.25 * f) + ')';
			espada.style.opacity = entra * (0.45 + 0.25 * Math.sin(t * 5 + 1) + 0.4 * f);
			var c = Math.floor(t * 20) % 4;
			if (c !== cuadro) {
				cuadro = c;
				rayos.forEach(function (r) {
					r.e.style.backgroundImage = 'url(' + RUTA + 'rayo_' + r.color + '_0' + ((c + r.fase) % 4 + 1) + '.png)';
				});
			}
			rayos.forEach(function (r) { r.e.style.opacity = entra * (0.45 + 0.55 * f) * (r.fase === 2 ? 0.85 : 1); });
			requestAnimationFrame(paso);
		}
		requestAnimationFrame(paso);
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
	else montar();
})();
