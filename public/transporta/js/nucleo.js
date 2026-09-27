(function () {
  'use strict';

  var raiz = document.documentElement;
  raiz.classList.remove('sin-js');
  raiz.classList.add('con-js');

  var reduceMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
  var punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)');
  var navEscritorio = window.matchMedia('(min-width: 1100px)');
  var inicio = performance.now();

  function limitar(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo);
  }

  /* Motor de scroll: una sola vuelta de rAF por frame para todas las escenas */

  var oyentes = [];
  var pendiente = false;

  function ejecutarEscenas() {
    pendiente = false;
    for (var i = 0; i < oyentes.length; i++) oyentes[i]();
  }

  function pedirFrame() {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(ejecutarEscenas);
  }

  window.addEventListener('scroll', pedirFrame, { passive: true });
  window.addEventListener('resize', pedirFrame);

  // Progreso 0..1 de una sección alta con contenido fijo: 0 cuando su borde superior toca arriba.
  function progresoFijado(elemento) {
    var caja = elemento.getBoundingClientRect();
    var recorrido = caja.height - window.innerHeight;
    return recorrido > 0 ? limitar(-caja.top / recorrido, 0, 1) : 0;
  }

  window.Transporta = {
    reduceMovimiento: reduceMovimiento,
    punteroFino: punteroFino,
    limitar: limitar,
    progresoFijado: progresoFijado,
    alScroll: function (funcion) {
      oyentes.push(funcion);
      pedirFrame();
    },
    refrescar: pedirFrame
  };

  var T = window.Transporta;

  function irA(destino) {
    destino.scrollIntoView({ behavior: reduceMovimiento.matches ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', function (evento) {
    var enlace = evento.target.closest('a[href^="#"]');
    if (!enlace || enlace.classList.contains('salto')) return;
    var id = enlace.getAttribute('href').slice(1);
    var destino = id && document.getElementById(id);
    if (!destino) return;
    evento.preventDefault();
    irA(destino);
    if (window.history.pushState) window.history.pushState(null, '', '#' + id);
  });

  /* Barra de progreso, cabecera compacta y transición de color por sección */

  var barra = document.querySelector('.progreso__barra');
  var cabecera = document.querySelector('.cabecera');
  var secciones = Array.prototype.slice.call(document.querySelectorAll('main > [data-tema], body > footer[data-tema]'));
  var menuAbierto = false;

  if (secciones.length) raiz.classList.add('con-transicion');

  function temaEn(y) {
    for (var i = 0; i < secciones.length; i++) {
      var caja = secciones[i].getBoundingClientRect();
      if (caja.top <= y && caja.bottom > y) return secciones[i].getAttribute('data-tema');
    }
    return null;
  }

  T.alScroll(function () {
    var recorrido = raiz.scrollHeight - window.innerHeight;
    var progreso = recorrido > 0 ? limitar(window.scrollY / recorrido, 0, 1) : 0;
    if (barra) barra.style.transform = 'scaleX(' + progreso + ')';
    if (!cabecera) return;
    cabecera.classList.toggle('cabecera--compacta', window.scrollY > 24);
    var temaCentro = temaEn(window.innerHeight * 0.5);
    if (temaCentro && raiz.getAttribute('data-tema-activo') !== temaCentro) raiz.setAttribute('data-tema-activo', temaCentro);
    var temaArriba = menuAbierto ? 'noche' : temaEn(30);
    if (temaArriba && cabecera.getAttribute('data-tema') !== temaArriba) cabecera.setAttribute('data-tema', temaArriba);
  });

  /* Menú a pantalla completa */

  var nav = document.querySelector('.nav');
  var botonMenu = document.querySelector('.nav__boton');
  var textoMenu = document.querySelector('.nav__boton-texto');
  var menu = document.getElementById('nav-menu');

  function abrirMenu() {
    menuAbierto = true;
    nav.classList.add('nav--abierta');
    botonMenu.setAttribute('aria-expanded', 'true');
    textoMenu.textContent = 'Cerrar';
    document.body.classList.add('sin-scroll');
    T.refrescar();
    var primerEnlace = menu.querySelector('a');
    if (primerEnlace) window.setTimeout(function () { primerEnlace.focus(); }, 300);
  }

  function cerrarMenu(devolverFoco) {
    if (!menuAbierto) return;
    menuAbierto = false;
    nav.classList.remove('nav--abierta');
    botonMenu.setAttribute('aria-expanded', 'false');
    textoMenu.textContent = 'Menú';
    document.body.classList.remove('sin-scroll');
    T.refrescar();
    if (devolverFoco) botonMenu.focus();
  }

  if (nav && botonMenu && menu) {
    botonMenu.addEventListener('click', function () {
      if (menuAbierto) cerrarMenu(true);
      else abrirMenu();
    });

    menu.addEventListener('click', function (evento) {
      if (evento.target.closest('a')) cerrarMenu(false);
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape') cerrarMenu(true);
    });

    // Con el menú abierto, el foco no puede escaparse al contenido tapado.
    nav.addEventListener('keydown', function (evento) {
      if (evento.key !== 'Tab' || !menuAbierto) return;
      var enfocables = [botonMenu].concat(Array.prototype.slice.call(menu.querySelectorAll('a')));
      var primero = enfocables[0];
      var ultimo = enfocables[enfocables.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    });

    navEscritorio.addEventListener('change', function () {
      cerrarMenu(false);
    });
  }

  /* Enlace activo según la sección visible */

  var enlacesNav = document.querySelectorAll('.nav__enlace[href^="#"]');

  if (enlacesNav.length && 'IntersectionObserver' in window) {
    var enlacePorSeccion = {};
    enlacesNav.forEach(function (enlace) {
      enlacePorSeccion[enlace.getAttribute('href').slice(1)] = enlace;
    });

    var observadorSecciones = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        enlacesNav.forEach(function (enlace) {
          enlace.removeAttribute('aria-current');
        });
        var activo = enlacePorSeccion[entrada.target.id];
        if (activo) activo.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main > section[id]').forEach(function (seccion) {
      observadorSecciones.observe(seccion);
    });
  }

  /* Aparición al hacer scroll y revelado con máscara */

  var revelables = document.querySelectorAll('.revelar, [data-mascara]');

  // Al terminar se quitan las clases para que los hovers propios no hereden el retardo.
  function liberar(elemento) {
    if (elemento.hasAttribute('data-mascara')) {
      elemento.classList.add('revelado');
      return;
    }
    elemento.classList.remove('revelar', 'revelado');
    elemento.style.removeProperty('--retardo');
  }

  if (reduceMovimiento.matches || !('IntersectionObserver' in window)) {
    revelables.forEach(liberar);
  } else {
    // Un elemento con clip-path a cero no cuenta como visible: la máscara se vigila a través de su contenedor.
    var objetivoDe = new Map();
    var observadorRevelado = new IntersectionObserver(function (entradas, observador) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        (objetivoDe.get(entrada.target) || entrada.target).classList.add('revelado');
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revelables.forEach(function (elemento) {
      if (elemento.classList.contains('revelar')) {
        var hermanos = Array.prototype.filter.call(elemento.parentElement.children, function (hermano) {
          return hermano.classList.contains('revelar');
        });
        elemento.style.setProperty('--retardo', Math.min(hermanos.indexOf(elemento) * 80, 480) + 'ms');
        elemento.addEventListener('transitionend', function alTerminar(evento) {
          if (evento.target !== elemento || evento.propertyName !== 'opacity') return;
          elemento.removeEventListener('transitionend', alTerminar);
          liberar(elemento);
        });
        observadorRevelado.observe(elemento);
        return;
      }
      objetivoDe.set(elemento.parentElement, elemento);
      observadorRevelado.observe(elemento.parentElement);
    });
  }

  /* Texto que se descifra letra a letra */

  var GLIFOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ=>{}();.#';

  T.descifrar = function (elemento, duracion) {
    var final = elemento.getAttribute('data-descifrar') || elemento.textContent;
    if (reduceMovimiento.matches) {
      elemento.textContent = final;
      return;
    }
    var total = duracion || 900;
    var comienzo = null;
    function paso(ahora) {
      if (comienzo === null) comienzo = ahora;
      var avance = limitar((ahora - comienzo) / total, 0, 1);
      var fijas = Math.floor(avance * final.length);
      var texto = final.slice(0, fijas);
      for (var i = fijas; i < final.length; i++) texto += GLIFOS[Math.floor(Math.random() * GLIFOS.length)];
      elemento.textContent = texto;
      if (avance < 1) window.requestAnimationFrame(paso);
    }
    window.requestAnimationFrame(paso);
  };

  document.querySelectorAll('[data-descifrar]').forEach(function (elemento) {
    elemento.parentElement.addEventListener('pointerenter', function () {
      T.descifrar(elemento, 600);
    });
  });

  /* Pantalla de carga (una vez por sesión) y entrada del hero */

  var cargador = document.querySelector('.cargador');
  var hero = document.querySelector('.hero');
  var DURACION_MINIMA_CARGA = 1300;
  var DURACION_MAXIMA_CARGA = 1800;

  function entrarHero() {
    if (hero) hero.classList.add('hero--listo');
    document.querySelectorAll('.hero [data-descifrar]').forEach(function (elemento) {
      window.setTimeout(function () { T.descifrar(elemento, 1100); }, 350);
    });
  }

  function yaCargado() {
    try {
      return window.sessionStorage.getItem('transporta-cargado') === '1';
    } catch (fallo) {
      return false;
    }
  }

  function marcarCargado() {
    try {
      window.sessionStorage.setItem('transporta-cargado', '1');
    } catch (fallo) {
      return;
    }
  }

  if (!cargador || reduceMovimiento.matches || yaCargado()) {
    if (cargador) cargador.remove();
    entrarHero();
  } else {
    var cerrado = false;
    var cerrarCargador = function () {
      if (cerrado) return;
      cerrado = true;
      marcarCargado();
      cargador.classList.add('cargador--fuera');
      window.setTimeout(entrarHero, 250);
      window.setTimeout(function () { cargador.remove(); }, 900);
    };
    var alCargar = function () {
      window.setTimeout(cerrarCargador, Math.max(0, DURACION_MINIMA_CARGA - (performance.now() - inicio)));
    };
    if (document.readyState === 'complete') alCargar();
    else window.addEventListener('load', alCargar);
    window.setTimeout(cerrarCargador, DURACION_MAXIMA_CARGA);
  }

  /* Botones magnéticos, relleno de botones e inclinación (solo con ratón) */

  if (punteroFino.matches && !reduceMovimiento.matches) {
    document.querySelectorAll('[data-magnetico]').forEach(function (elemento) {
      elemento.addEventListener('pointermove', function (evento) {
        var caja = elemento.getBoundingClientRect();
        var dx = evento.clientX - (caja.left + caja.width / 2);
        var dy = evento.clientY - (caja.top + caja.height / 2);
        elemento.style.transform = 'translate(' + dx * 0.25 + 'px,' + dy * 0.35 + 'px)';
      });
      elemento.addEventListener('pointerleave', function () {
        elemento.style.transform = '';
      });
    });

    document.querySelectorAll('[data-tilt]').forEach(function (tarjeta) {
      tarjeta.addEventListener('pointermove', function (evento) {
        var caja = tarjeta.getBoundingClientRect();
        var x = (evento.clientX - caja.left) / caja.width;
        var y = (evento.clientY - caja.top) / caja.height;
        tarjeta.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
        tarjeta.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg');
        tarjeta.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        tarjeta.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      tarjeta.addEventListener('pointerleave', function () {
        tarjeta.style.setProperty('--rx', '0deg');
        tarjeta.style.setProperty('--ry', '0deg');
      });
    });

    var gigante = document.querySelector('[data-fuente-variable]');
    var pie = gigante && gigante.closest('footer');
    if (pie) {
      pie.addEventListener('pointermove', function (evento) {
        var x = evento.clientX / window.innerWidth;
        gigante.style.setProperty('--ancho-gigante', Math.round(62 + x * 38) + '%');
      });
      pie.addEventListener('pointerleave', function () {
        gigante.style.removeProperty('--ancho-gigante');
      });
    }
  }

  function situarRelleno(evento) {
    var boton = evento.currentTarget;
    var caja = boton.getBoundingClientRect();
    boton.style.setProperty('--x', ((evento.clientX - caja.left) / caja.width * 100).toFixed(1) + '%');
    boton.style.setProperty('--y', ((evento.clientY - caja.top) / caja.height * 100).toFixed(1) + '%');
  }

  document.querySelectorAll('.boton').forEach(function (boton) {
    boton.addEventListener('pointerenter', situarRelleno);
    boton.addEventListener('pointerleave', situarRelleno);
  });

  /* Contadores que suben al aparecer */

  var contadores = document.querySelectorAll('[data-contar]');

  function formatear(valor, decimales) {
    return new Intl.NumberFormat('es-ES', { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valor);
  }

  function contar(elemento) {
    var destino = parseFloat(elemento.getAttribute('data-contar'));
    var decimales = parseInt(elemento.getAttribute('data-decimales') || '0', 10);
    var duracion = 1600;
    var comienzo = null;
    function paso(ahora) {
      if (comienzo === null) comienzo = ahora;
      var k = limitar((ahora - comienzo) / duracion, 0, 1);
      var suavizado = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      elemento.textContent = formatear(destino * suavizado, decimales);
      if (k < 1) window.requestAnimationFrame(paso);
    }
    window.requestAnimationFrame(paso);
  }

  if (contadores.length && !reduceMovimiento.matches && 'IntersectionObserver' in window) {
    var observadorContadores = new IntersectionObserver(function (entradas, observador) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        observador.unobserve(entrada.target);
        contar(entrada.target);
      });
    }, { threshold: 0.6 });
    contadores.forEach(function (elemento) {
      elemento.textContent = formatear(0, parseInt(elemento.getAttribute('data-decimales') || '0', 10));
      observadorContadores.observe(elemento);
    });
  }

  /* Acordeón de preguntas */

  var botonesAcordeon = document.querySelectorAll('.acordeon__boton');

  function fijarAcordeon(boton, abrir) {
    boton.setAttribute('aria-expanded', String(abrir));
    boton.closest('.acordeon__item').classList.toggle('is-abierto', abrir);
  }

  botonesAcordeon.forEach(function (boton) {
    boton.addEventListener('click', function () {
      var abrir = boton.getAttribute('aria-expanded') !== 'true';
      boton.closest('.acordeon').querySelectorAll('.acordeon__boton').forEach(function (otro) {
        if (otro !== boton) fijarAcordeon(otro, false);
      });
      fijarAcordeon(boton, abrir);
    });
  });

  /* Título y favicon que llaman al volver de otra pestaña */

  var favicon = document.querySelector('[data-favicon]');
  var tituloOriginal = document.title;
  var faviconOriginal = favicon ? favicon.getAttribute('href') : '';

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      document.title = '// Vuelve: tu código sigue en Java';
      if (favicon) favicon.setAttribute('href', 'assets/favicon-java.svg');
    } else {
      document.title = tituloOriginal;
      if (favicon) favicon.setAttribute('href', faviconOriginal);
    }
  });

  /* Toast */

  var toast = document.querySelector('[data-toast]');
  var toastMensaje = toast ? toast.querySelector('.toast__mensaje') : null;
  var temporizadorToast = 0;

  function ocultarToast() {
    window.clearTimeout(temporizadorToast);
    toast.classList.remove('is-visible');
  }

  T.toast = function (mensaje, tipo) {
    if (!toast) return;
    window.clearTimeout(temporizadorToast);
    toast.classList.toggle('toast--error', tipo === 'error');
    toast.classList.add('is-visible');
    toastMensaje.textContent = '';
    // El texto se escribe cuando la región ya es visible para que el lector de pantalla lo anuncie.
    window.setTimeout(function () {
      toastMensaje.textContent = mensaje;
    }, 60);
    temporizadorToast = window.setTimeout(ocultarToast, 5000);
  };

  if (toast) {
    toast.querySelector('.toast__cerrar').addEventListener('click', ocultarToast);
  }
})();
