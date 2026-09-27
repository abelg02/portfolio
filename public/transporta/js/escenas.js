(function () {
  'use strict';

  var T = window.Transporta;
  if (!T) return;

  var raiz = document.documentElement;
  var limitar = T.limitar;
  var reduceMovimiento = T.reduceMovimiento;
  var escritorio = window.matchMedia('(min-width: 1024px)');

  function crear(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto) nodo.textContent = texto;
    return nodo;
  }

  function suavizar(k) {
    return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  }

  /* ─────────────────────────────────────────────
     1 · Reescritura de Java a ABAP (sección fijada)
     ───────────────────────────────────────────── */

  (function () {
    var seccion = document.querySelector('.reescritura');
    var destino = seccion && seccion.querySelector('[data-panel-destino]');
    var tabla = seccion && seccion.querySelector('.equivalencias-codigo');
    if (!seccion || !destino || !tabla) return;

    var notas = Array.prototype.slice.call(seccion.querySelectorAll('.reescritura__notas li'));
    var LERP = 0.12;
    var UMBRAL_REPOSO = 0.0005;
    // Parte del recorrido en la que arrancan las líneas; el resto deja ver el final con calma.
    var TRAMO = 0.8;
    // Cada línea dura 1,6 veces su hueco, así se solapa con la siguiente y no hay pausas.
    var SOLAPE = 1.6;
    var DURACION_AUTO = 4800;
    var DURACION_ALTERNAR = 1200;
    var ESPERA_AVISO = 2500;

    var lineas = [];
    var ui = null;
    var modo = null;
    var limpiezas = [];
    var actual = 0;
    var objetivo = 0;
    var rafId = 0;
    var ultimaNota = null;
    var ultimoEstado = null;
    var ultimaActiva = -2;

    function construir() {
      var filas = tabla.tBodies[0] ? tabla.tBodies[0].rows : [];
      if (!filas.length) throw new Error('La tabla de equivalencias está vacía');

      var envoltorio = crear('div', 'panel-efecto');
      envoltorio.setAttribute('aria-hidden', 'true');

      var panel = crear('div', 'panel-codigo');
      var pestanas = crear('div', 'panel-codigo__pestanas');
      var luces = crear('span', 'panel-codigo__luces');
      luces.append(crear('span'), crear('span'), crear('span'));
      var pestanaJava = crear('span', 'panel-codigo__pestana panel-codigo__pestana--java', 'Pedidos.java');
      var pestanaAbap = crear('span', 'panel-codigo__pestana panel-codigo__pestana--abap', 'zcl_pedidos.clas.abap');
      pestanas.append(luces, pestanaJava, pestanaAbap);

      var cuerpo = crear('div', 'panel-codigo__cuerpo');
      var lista = crear('ol', 'panel-codigo__lineas');
      var nuevasLineas = Array.prototype.map.call(filas, function (fila, indice) {
        var java = fila.cells[0].textContent;
        var abap = fila.cells[1].textContent;
        var li = crear('li', 'panel-codigo__linea');
        var texto = crear('span', 'panel-codigo__texto');
        var trozoAbap = crear('span', 'trozo-abap');
        var trozoJava = crear('span', 'trozo-java', java);
        texto.append(trozoAbap, crear('span', 'panel-codigo__cursor'), trozoJava);
        li.append(crear('span', 'panel-codigo__numero', String(indice + 1)), texto);
        lista.append(li);
        return {
          java: java,
          abap: abap,
          nota: fila.getAttribute('data-nota') || '',
          li: li,
          trozoAbap: trozoAbap,
          trozoJava: trozoJava,
          corteAbap: 0,
          corteJava: 0,
          estado: ''
        };
      });
      cuerpo.append(lista);

      var estado = crear('div', 'panel-codigo__estado');
      var lenguaje = crear('span', 'panel-codigo__lenguaje');
      var progreso = crear('span', 'panel-codigo__progreso');
      estado.append(lenguaje, progreso);
      panel.append(pestanas, cuerpo, estado);

      var nota = crear('p', 'panel-nota');
      var aviso = crear('p', 'panel-aviso', 'Sigue bajando para reescribirlo ↓');
      envoltorio.append(panel, nota, aviso);

      var alternar = crear('button', 'boton boton--secundario panel-alternar', 'Ver en Java');
      alternar.type = 'button';
      alternar.hidden = true;

      destino.insertBefore(envoltorio, destino.firstChild);
      envoltorio.after(alternar);

      lineas = nuevasLineas;
      ui = {
        envoltorio: envoltorio,
        panel: panel,
        pestanaJava: pestanaJava,
        pestanaAbap: pestanaAbap,
        estado: estado,
        lenguaje: lenguaje,
        progreso: progreso,
        nota: nota,
        aviso: aviso,
        alternar: alternar
      };
      ultimaNota = null;
      ultimoEstado = null;
      ultimaActiva = -2;
    }

    function pintar(p) {
      var total = lineas.length;
      var hueco = TRAMO / total;
      var duracion = hueco * SOLAPE;
      var fin = (total - 1) * hueco + duracion;

      var avances = lineas.map(function (linea, i) {
        return limitar((p - i * hueco) / duracion, 0, 1);
      });

      var activa = -1;
      avances.forEach(function (t, i) {
        if (t > 0 && t < 1) activa = i;
      });

      lineas.forEach(function (linea, i) {
        var t = avances[i];
        var corteAbap = Math.round(t * linea.abap.length);
        var corteJava = Math.round(t * linea.java.length);
        if (corteAbap !== linea.corteAbap) {
          linea.trozoAbap.textContent = linea.abap.slice(0, corteAbap);
          linea.corteAbap = corteAbap;
        }
        if (corteJava !== linea.corteJava) {
          linea.trozoJava.textContent = linea.java.slice(corteJava);
          linea.corteJava = corteJava;
        }
        var estado = i === activa ? 'escribiendo' : (p === 0 && i === 0 ? 'esperando' : '');
        if (estado !== linea.estado) {
          linea.li.classList.toggle('is-escribiendo', estado === 'escribiendo');
          linea.li.classList.toggle('is-esperando', estado === 'esperando');
          linea.estado = estado;
        }
      });

      var porcentaje = Math.round(limitar(p / fin, 0, 1) * 100);
      var terminado = avances[total - 1] === 1;
      var enAbap = porcentaje >= 50;
      var claveEstado = porcentaje + (terminado ? 'fin' : '');

      if (claveEstado !== ultimoEstado) {
        ui.pestanaJava.classList.toggle('is-activa', !enAbap);
        ui.pestanaAbap.classList.toggle('is-activa', enAbap);
        ui.lenguaje.textContent = (enAbap ? 'ABAP' : 'Java') + ' · ' + total + ' líneas';
        ui.progreso.textContent = terminado ? '✓ Activado' : porcentaje + ' % reescrito';
        ui.estado.classList.toggle('is-activado', terminado);
        ui.panel.style.setProperty('--brillo', terminado ? '1' : '0');
        ultimoEstado = claveEstado;
      }

      var nota;
      if (activa >= 0) nota = lineas[activa].nota;
      else if (terminado) nota = 'mismo programa, otro lenguaje';
      else nota = 'esto es Java; ahora lo reescribimos en ABAP';
      if (nota !== ultimaNota) {
        ui.nota.textContent = '// ' + nota;
        ultimaNota = nota;
      }

      if (activa !== ultimaActiva && notas.length) {
        var hechas = terminado ? total : (activa >= 0 ? activa : Math.round(porcentaje / 100 * total));
        notas.forEach(function (li, i) {
          li.classList.toggle('is-activa', i === activa);
          li.classList.toggle('is-hecha', i < hechas && i !== activa);
        });
        ultimaActiva = activa;
      }
    }

    function pararBucle() {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    function iniciarScroll() {
      var temporizadorAviso = 0;
      var activo = true;

      function bucle() {
        actual += (objetivo - actual) * LERP;
        if (Math.abs(objetivo - actual) < UMBRAL_REPOSO) {
          actual = objetivo;
          pintar(actual);
          rafId = 0;
          return;
        }
        pintar(actual);
        rafId = window.requestAnimationFrame(bucle);
      }

      function programarAviso() {
        ui.aviso.classList.remove('is-visible');
        window.clearTimeout(temporizadorAviso);
        temporizadorAviso = window.setTimeout(function () {
          var caja = seccion.getBoundingClientRect();
          if (activo && actual === 0 && caja.top <= 0 && caja.bottom > window.innerHeight) ui.aviso.classList.add('is-visible');
        }, ESPERA_AVISO);
      }

      function alScroll() {
        if (!activo) return;
        var nuevo = T.progresoFijado(seccion);
        if (nuevo !== objetivo) {
          objetivo = nuevo;
          programarAviso();
        }
        if (!rafId && Math.abs(objetivo - actual) >= UMBRAL_REPOSO) rafId = window.requestAnimationFrame(bucle);
      }

      seccion.classList.add('is-scroll');
      pintar(actual);
      T.alScroll(alScroll);

      limpiezas.push(function () {
        activo = false;
        window.clearTimeout(temporizadorAviso);
        ui.aviso.classList.remove('is-visible');
        pararBucle();
        seccion.classList.remove('is-scroll');
      });
    }

    function iniciarAuto() {
      var animacion = null;
      var visible = false;
      var reproducido = actual > 0;
      var enAbap = actual >= 0.5;

      function puedeAnimar() {
        return visible && !document.hidden;
      }

      function paso(ahora) {
        if (animacion.ultimo !== null) animacion.transcurrido += ahora - animacion.ultimo;
        animacion.ultimo = ahora;
        var k = limitar(animacion.transcurrido / animacion.duracion, 0, 1);
        actual = animacion.desde + (animacion.hasta - animacion.desde) * suavizar(k);
        pintar(actual);
        if (k < 1) {
          rafId = window.requestAnimationFrame(paso);
          return;
        }
        rafId = 0;
        var alTerminar = animacion.alTerminar;
        animacion = null;
        if (alTerminar) alTerminar();
      }

      function reanudar() {
        if (!animacion || rafId || !puedeAnimar()) return;
        animacion.ultimo = null;
        rafId = window.requestAnimationFrame(paso);
      }

      function animarHacia(hasta, duracion, alTerminar) {
        pararBucle();
        animacion = { desde: actual, hasta: hasta, duracion: duracion, transcurrido: 0, ultimo: null, alTerminar: alTerminar };
        reanudar();
      }

      function etiquetarBoton() {
        ui.alternar.textContent = enAbap ? 'Ver en Java' : 'Ver en ABAP';
      }

      function mostrarBoton() {
        enAbap = actual >= 0.5;
        etiquetarBoton();
        ui.alternar.hidden = false;
      }

      function alAlternar() {
        enAbap = !enAbap;
        etiquetarBoton();
        animarHacia(enAbap ? 1 : 0, DURACION_ALTERNAR);
      }

      function alCambiarPestana() {
        if (document.hidden) pararBucle();
        else reanudar();
      }

      var observador = new IntersectionObserver(function (entradas) {
        var entrada = entradas[entradas.length - 1];
        visible = entrada.isIntersecting;
        if (!visible) {
          pararBucle();
          return;
        }
        if (!reproducido && entrada.intersectionRatio >= 0.4) {
          reproducido = true;
          animarHacia(1, DURACION_AUTO, mostrarBoton);
          return;
        }
        reanudar();
      }, { threshold: [0, 0.4] });

      raiz.classList.add('efecto-auto');
      pintar(actual);
      if (reproducido) mostrarBoton();

      observador.observe(ui.envoltorio);
      ui.alternar.addEventListener('click', alAlternar);
      document.addEventListener('visibilitychange', alCambiarPestana);

      limpiezas.push(function () {
        observador.disconnect();
        ui.alternar.removeEventListener('click', alAlternar);
        document.removeEventListener('visibilitychange', alCambiarPestana);
        pararBucle();
        animacion = null;
        ui.alternar.hidden = true;
        raiz.classList.remove('efecto-auto');
      });
    }

    function detener() {
      limpiezas.forEach(function (limpiar) {
        limpiar();
      });
      limpiezas = [];
      modo = null;
    }

    function desmontar() {
      detener();
      if (ui) {
        ui.envoltorio.remove();
        ui.alternar.remove();
      }
      ui = null;
      lineas = [];
      actual = 0;
      objetivo = 0;
      notas.forEach(function (li) {
        li.classList.remove('is-activa', 'is-hecha');
      });
      raiz.classList.remove('efecto-listo', 'efecto-auto');
    }

    function aplicarModo() {
      try {
        if (reduceMovimiento.matches) {
          desmontar();
          return;
        }
        if (!ui) {
          construir();
          raiz.classList.add('efecto-listo');
        }
        var siguiente = escritorio.matches ? 'scroll' : 'auto';
        if (siguiente === modo) return;
        detener();
        modo = siguiente;
        if (modo === 'scroll') iniciarScroll();
        else iniciarAuto();
      } catch (fallo) {
        // Cualquier fallo deja la tabla estática, que ya es contenido completo.
        desmontar();
      }
    }

    aplicarModo();
    reduceMovimiento.addEventListener('change', aplicarModo);
    escritorio.addEventListener('change', aplicarModo);
  })();

  /* ─────────────────────────────────────────────
     2 · Manifiesto que se rellena palabra a palabra
     ───────────────────────────────────────────── */

  (function () {
    var texto = document.querySelector('[data-rellenar]');
    if (!texto || reduceMovimiento.matches) return;

    var CLAVES = /^(dialecto|diccionario|ABAP)/;
    var original = texto.textContent.trim();
    var palabras = original.split(/\s+/);
    texto.textContent = '';
    // Los lectores de pantalla leen la frase entera; las palabras sueltas son solo visuales.
    texto.append(crear('span', 'visualmente-oculto', original));
    var spans = palabras.map(function (palabra, i) {
      var span = crear('span', 'palabra' + (CLAVES.test(palabra) ? ' palabra--clave' : ''), palabra);
      span.setAttribute('aria-hidden', 'true');
      texto.append(span);
      if (i < palabras.length - 1) texto.append(' ');
      return span;
    });
    var encendidas = -1;

    T.alScroll(function () {
      var caja = texto.getBoundingClientRect();
      var alto = window.innerHeight;
      if (caja.bottom < -alto || caja.top > alto * 2) return;
      var progreso = limitar((alto * 0.82 - caja.top) / (caja.height + alto * 0.35), 0, 1);
      var nuevas = Math.round(progreso * spans.length);
      if (nuevas === encendidas) return;
      spans.forEach(function (span, i) {
        span.classList.toggle('is-leida', i < nuevas);
      });
      encendidas = nuevas;
    });
  })();

  /* ─────────────────────────────────────────────
     3 · Marquesina que cambia de sentido con el scroll
     ───────────────────────────────────────────── */

  (function () {
    var marquesina = document.querySelector('.marquesina');
    var pista = marquesina && marquesina.querySelector('.marquesina__pista');
    if (!pista || reduceMovimiento.matches) return;

    Array.prototype.slice.call(pista.children).forEach(function (hijo) {
      pista.append(hijo.cloneNode(true));
    });

    var VELOCIDAD_BASE = 0.6;
    var x = 0;
    var sentido = 1;
    var impulso = 0;
    var ultimoScroll = window.scrollY;
    var visible = false;
    var rafId = 0;

    function bucle() {
      rafId = 0;
      if (!visible || document.hidden) return;
      var mitad = pista.scrollWidth / 2;
      impulso *= 0.92;
      x -= (VELOCIDAD_BASE + impulso) * sentido;
      if (x <= -mitad) x += mitad;
      if (x > 0) x -= mitad;
      pista.style.transform = 'translate3d(' + x + 'px,0,0)';
      rafId = window.requestAnimationFrame(bucle);
    }

    function arrancar() {
      if (!rafId) rafId = window.requestAnimationFrame(bucle);
    }

    T.alScroll(function () {
      var delta = window.scrollY - ultimoScroll;
      ultimoScroll = window.scrollY;
      if (delta !== 0) sentido = delta > 0 ? 1 : -1;
      impulso = Math.min(impulso + Math.abs(delta) * 0.08, 14);
    });

    new IntersectionObserver(function (entradas) {
      visible = entradas[0].isIntersecting;
      if (visible) arrancar();
    }).observe(marquesina);

    document.addEventListener('visibilitychange', arrancar);
  })();

  /* ─────────────────────────────────────────────
     4 · Temario: scroll horizontal dentro del vertical
     ───────────────────────────────────────────── */

  (function () {
    var seccion = document.querySelector('.temario');
    var pista = seccion && seccion.querySelector('.temario__pista');
    var ruta = seccion && seccion.querySelector('.temario__ruta');
    if (!seccion || !pista) return;

    var distancia = 0;
    var horizontal = false;

    function medir() {
      horizontal = escritorio.matches && !reduceMovimiento.matches;
      seccion.classList.toggle('is-horizontal', horizontal);
      if (!horizontal) {
        seccion.style.removeProperty('--alto-temario');
        pista.style.removeProperty('--desplazamiento');
        return;
      }
      distancia = Math.max(0, pista.scrollWidth - window.innerWidth);
      seccion.style.setProperty('--alto-temario', (window.innerHeight + distancia) + 'px');
    }

    function dibujar(progreso) {
      if (ruta) ruta.style.setProperty('--dibujo', (1 - progreso).toFixed(4));
    }

    T.alScroll(function () {
      if (!horizontal) return;
      var progreso = T.progresoFijado(seccion);
      pista.style.setProperty('--desplazamiento', (-progreso * distancia).toFixed(1) + 'px');
      dibujar(progreso);
    });

    pista.addEventListener('scroll', function () {
      if (horizontal) return;
      var maximo = pista.scrollWidth - pista.clientWidth;
      dibujar(maximo > 0 ? pista.scrollLeft / maximo : 1);
    }, { passive: true });

    var temporizador = 0;
    window.addEventListener('resize', function () {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(function () {
        medir();
        T.refrescar();
      }, 150);
    });
    escritorio.addEventListener('change', medir);
    reduceMovimiento.addEventListener('change', medir);

    medir();
    if (!horizontal) dibujar(0);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
      medir();
      T.refrescar();
    });
  })();

  /* ─────────────────────────────────────────────
     5 · Ruta de transporte DEV → QAS → PRD
     ───────────────────────────────────────────── */

  (function () {
    var transporte = document.querySelector('.transporte');
    if (!transporte) return;
    var trazos = transporte.querySelectorAll('.transporte__trazo');
    var pasos = transporte.querySelectorAll('.paso');
    var HITOS = [0.02, 0.5, 0.97];

    if (reduceMovimiento.matches) {
      trazos.forEach(function (trazo) { trazo.style.setProperty('--dibujo', '0'); });
      pasos.forEach(function (paso) { paso.classList.add('is-alcanzado'); });
      return;
    }

    T.alScroll(function () {
      var caja = transporte.getBoundingClientRect();
      var alto = window.innerHeight;
      var progreso = limitar((alto * 0.85 - caja.top) / (caja.height * 0.9 + alto * 0.25), 0, 1);
      trazos.forEach(function (trazo) {
        trazo.style.setProperty('--dibujo', (1 - progreso).toFixed(4));
      });
      pasos.forEach(function (paso, i) {
        paso.classList.toggle('is-alcanzado', progreso >= HITOS[i]);
      });
    });
  })();
})();
