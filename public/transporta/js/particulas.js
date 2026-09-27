(function () {
  'use strict';

  var T = window.Transporta;
  var hero = document.querySelector('.hero');
  var lienzo = document.querySelector('.hero__lienzo');
  if (!T || !hero || !lienzo) return;

  var ctx = lienzo.getContext && lienzo.getContext('2d');
  if (!ctx) return;

  var raiz = document.documentElement;
  var limitar = T.limitar;

  var ORIGEN = 'Java';
  var DESTINO = 'ABAP.';
  var COLOR_JAVA = [255, 106, 43];
  var COLOR_ABAP = [69, 230, 168];
  var NIVELES_COLOR = 12;
  var PARTICULAS_ESCRITORIO = 2600;
  var PARTICULAS_MOVIL = 1100;
  var LERP = 0.08;
  var RADIO_RATON = 110;
  var FUERZA_RATON = 34;
  var DISPERSION = 170;

  var ancho = 0;
  var alto = 0;
  var dpr = 1;
  var particulas = [];
  var progreso = 0;
  var objetivo = 0;
  var tiempo = 0;
  var rafId = 0;
  var visible = true;
  var raton = { x: -9999, y: -9999, nx: 0, ny: 0 };
  var parallaxX = 0;
  var parallaxY = 0;
  var cubos = [];
  var estilos = [];

  for (var n = 0; n <= NIVELES_COLOR; n++) {
    var k = n / NIVELES_COLOR;
    estilos.push('rgb(' + Math.round(COLOR_JAVA[0] + (COLOR_ABAP[0] - COLOR_JAVA[0]) * k) + ',' +
      Math.round(COLOR_JAVA[1] + (COLOR_ABAP[1] - COLOR_JAVA[1]) * k) + ',' +
      Math.round(COLOR_JAVA[2] + (COLOR_ABAP[2] - COLOR_JAVA[2]) * k) + ')');
    cubos.push([], []);
  }

  function esEscritorio() {
    return window.innerWidth >= 1024;
  }

  // Zona del lienzo donde se escriben las palabras: a la derecha en escritorio, arriba en móvil.
  function zonaTexto() {
    if (esEscritorio()) return { x: ancho * 0.5, y: alto * 0.16, w: ancho * 0.46, h: alto * 0.56 };
    return { x: ancho * 0.06, y: alto * 0.13, w: ancho * 0.88, h: alto * 0.26 };
  }

  function muestrear(texto, zona) {
    var c = document.createElement('canvas');
    var w = Math.max(1, Math.round(zona.w));
    var h = Math.max(1, Math.round(zona.h));
    c.width = w;
    c.height = h;
    var x = c.getContext('2d');
    var familia = '"Archivo", "Arial Narrow", sans-serif';
    var tam = h * 0.9;
    if ('fontStretch' in x) x.fontStretch = 'condensed';
    x.font = '900 ' + tam + 'px ' + familia;
    var medida = x.measureText(texto).width;
    if (medida > w * 0.96) tam = tam * (w * 0.96) / medida;
    x.font = '900 ' + tam + 'px ' + familia;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = '#fff';
    x.fillText(texto, w / 2, h / 2);
    var datos = x.getImageData(0, 0, w, h).data;
    var paso = Math.max(2, Math.round(Math.min(w, h) / 160));
    var puntos = [];
    for (var yy = 0; yy < h; yy += paso) {
      for (var xx = 0; xx < w; xx += paso) {
        if (datos[(yy * w + xx) * 4 + 3] > 140) puntos.push([zona.x + xx, zona.y + yy]);
      }
    }
    return puntos;
  }

  function elegir(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function construir() {
    var caja = hero.querySelector('.hero__fijo').getBoundingClientRect();
    ancho = caja.width;
    alto = caja.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var zona = zonaTexto();
    var puntosA = muestrear(ORIGEN, zona);
    var puntosB = muestrear(DESTINO, zona);
    if (!puntosA.length || !puntosB.length) return;

    var total = esEscritorio() ? PARTICULAS_ESCRITORIO : PARTICULAS_MOVIL;
    particulas = [];
    for (var i = 0; i < total; i++) {
      var a = elegir(puntosA);
      var b = elegir(puntosB);
      var angulo = Math.random() * Math.PI * 2;
      var fuerza = DISPERSION * (0.4 + Math.random() * 0.6);
      particulas.push({
        ax: a[0], ay: a[1], bx: b[0], by: b[1],
        z: Math.random() * 2 - 1,
        dx: Math.cos(angulo) * fuerza,
        dy: Math.sin(angulo) * fuerza,
        retraso: Math.random() * 0.3,
        fase: Math.random() * Math.PI * 2,
        tam: 1.1 + Math.random() * 1.5,
        empujeX: 0,
        empujeY: 0
      });
    }
  }

  function suavizar(k) {
    return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  }

  function pintar() {
    ctx.clearRect(0, 0, ancho, alto);
    for (var c = 0; c < cubos.length; c++) cubos[c].length = 0;

    parallaxX += (raton.nx - parallaxX) * 0.06;
    parallaxY += (raton.ny - parallaxY) * 0.06;
    var reposo = raiz.classList.contains('efecto-hero') ? 1 : 0;

    for (var i = 0; i < particulas.length; i++) {
      var p = particulas[i];
      var e = suavizar(limitar((progreso - p.retraso * 0.6) / 0.7, 0, 1));
      var arco = Math.sin(Math.PI * e);
      var x = p.ax + (p.bx - p.ax) * e + p.dx * arco + p.z * parallaxX * 26;
      var y = p.ay + (p.by - p.ay) * e + p.dy * arco + p.z * parallaxY * 18;
      x += Math.sin(tiempo * 0.9 + p.fase) * 1.4 * reposo;
      y += Math.cos(tiempo * 0.7 + p.fase) * 1.4 * reposo;

      var ddx = x - raton.x;
      var ddy = y - raton.y;
      var distancia2 = ddx * ddx + ddy * ddy;
      var empujeX = 0;
      var empujeY = 0;
      if (distancia2 < RADIO_RATON * RADIO_RATON) {
        var distancia = Math.sqrt(distancia2) || 1;
        var intensidad = (1 - distancia / RADIO_RATON) * FUERZA_RATON;
        empujeX = ddx / distancia * intensidad;
        empujeY = ddy / distancia * intensidad;
      }
      p.empujeX += (empujeX - p.empujeX) * 0.12;
      p.empujeY += (empujeY - p.empujeY) * 0.12;

      var nivel = Math.round(e * NIVELES_COLOR);
      var capa = p.z > 0 ? 1 : 0;
      cubos[nivel * 2 + capa].push(x + p.empujeX, y + p.empujeY, p.tam * (1 + p.z * 0.35));
    }

    for (var j = 0; j < cubos.length; j++) {
      var lista = cubos[j];
      if (!lista.length) continue;
      ctx.globalAlpha = j % 2 ? 0.95 : 0.5;
      ctx.fillStyle = estilos[Math.floor(j / 2)];
      ctx.beginPath();
      for (var m = 0; m < lista.length; m += 3) ctx.rect(lista[m], lista[m + 1], lista[m + 2], lista[m + 2]);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function leerObjetivo() {
    if (!raiz.classList.contains('efecto-hero')) return;
    objetivo = limitar(T.progresoFijado(hero) * 1.3, 0, 1);
  }

  function bucle(ahora) {
    rafId = 0;
    if (!visible || document.hidden) return;
    tiempo = ahora / 1000;
    progreso += (objetivo - progreso) * LERP;
    pintar();
    rafId = window.requestAnimationFrame(bucle);
  }

  function arrancar() {
    if (!rafId && !T.reduceMovimiento.matches) rafId = window.requestAnimationFrame(bucle);
  }

  function modoEstatico() {
    raiz.classList.remove('efecto-hero');
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    construir();
    progreso = 1;
    objetivo = 1;
    pintar();
  }

  function iniciar() {
    if (T.reduceMovimiento.matches) {
      modoEstatico();
      return;
    }
    raiz.classList.add('efecto-hero');
    construir();
    leerObjetivo();
    progreso = objetivo;
    arrancar();
  }

  var temporizadorResize = 0;
  var anchoPrevio = window.innerWidth;

  window.addEventListener('resize', function () {
    // En móvil la barra del navegador cambia el alto al hacer scroll: solo se reconstruye si cambia el ancho.
    if (window.innerWidth === anchoPrevio && !esEscritorio()) return;
    anchoPrevio = window.innerWidth;
    window.clearTimeout(temporizadorResize);
    temporizadorResize = window.setTimeout(function () {
      construir();
      if (T.reduceMovimiento.matches) pintar();
    }, 200);
  });

  hero.addEventListener('pointermove', function (evento) {
    var caja = lienzo.getBoundingClientRect();
    raton.x = evento.clientX - caja.left;
    raton.y = evento.clientY - caja.top;
    raton.nx = (evento.clientX / window.innerWidth) * 2 - 1;
    raton.ny = (evento.clientY / window.innerHeight) * 2 - 1;
  });

  hero.addEventListener('pointerleave', function () {
    raton.x = -9999;
    raton.y = -9999;
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      visible = entradas[0].isIntersecting;
      if (visible) arrancar();
    }).observe(hero);
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) arrancar();
  });

  T.alScroll(leerObjetivo);

  T.reduceMovimiento.addEventListener('change', function () {
    if (T.reduceMovimiento.matches) modoEstatico();
    else iniciar();
  });

  // Se espera a la fuente para que las partículas dibujen las letras reales de la marca.
  var fuente = document.fonts && document.fonts.load ? document.fonts.load('900 100px "Archivo"') : Promise.resolve();
  Promise.race([fuente, new Promise(function (resolver) { window.setTimeout(resolver, 1500); })])
    .then(iniciar, iniciar);
})();
