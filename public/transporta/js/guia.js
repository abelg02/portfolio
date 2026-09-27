(function () {
  'use strict';

  var T = window.Transporta;
  if (!T) return;

  function avisar(texto, tipo) {
    T.toast(texto, tipo);
  }

  /* Copiar al portapapeles, con alternativa para navegadores sin API moderna */

  function copiarClasico(texto) {
    return new Promise(function (resolver, rechazar) {
      var area = document.createElement('textarea');
      area.value = texto;
      area.setAttribute('readonly', '');
      area.className = 'visualmente-oculto';
      document.body.append(area);
      area.select();
      var ok = document.execCommand('copy');
      area.remove();
      if (ok) resolver();
      else rechazar(new Error('No se pudo copiar'));
    });
  }

  // La API moderna puede negarse (sin permiso o sin foco): entonces se intenta el método clásico.
  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).catch(function () {
        return copiarClasico(texto);
      });
    }
    return copiarClasico(texto);
  }

  function marcarCopiado(boton, textoTemporal) {
    var original = boton.getAttribute('data-texto-original') || boton.innerHTML;
    boton.setAttribute('data-texto-original', original);
    boton.classList.add('is-copiado');
    if (textoTemporal) boton.textContent = textoTemporal;
    window.clearTimeout(boton._temporizador);
    boton._temporizador = window.setTimeout(function () {
      boton.classList.remove('is-copiado');
      boton.innerHTML = original;
    }, 1800);
  }

  /* Resaltado de sintaxis ABAP: comentarios, textos y palabras clave */

  var CLAVES = ('DATA TYPE TYPES VALUE FOR IN WHERE LOOP AT INTO ENDLOOP IF ENDIF ELSE ELSEIF SELECT SINGLE FROM TABLE ' +
    'INNER JOIN AS ON UP TO ROWS CLASS DEFINITION IMPLEMENTATION ENDCLASS METHOD METHODS ENDMETHOD PUBLIC ' +
    'PRIVATE PROTECTED SECTION FINAL CREATE TESTING DURATION SHORT RISK LEVEL HARMLESS TRY CATCH ENDTRY ' +
    'RAISE EXCEPTION NEW REDUCE INIT NEXT CONV COND WHEN THEN CORRESPONDING MAPPING EXCEPT GROUP BY IS NOT ' +
    'INITIAL BOUND INTERFACES CALL FUNCTION EXPORTING IMPORTING CHANGING MESSAGE LENGTH DECIMALS ALL ENTRIES ' +
    'OPTIONAL REF AND OR').split(' ');
  var esClave = {};
  CLAVES.forEach(function (clave) { esClave[clave] = true; });

  function escapar(texto) {
    return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function envolver(clase, texto) {
    return '<span class="' + clase + '">' + escapar(texto) + '</span>';
  }

  function resaltarCodigo(fragmento) {
    return fragmento.replace(/[A-Za-z_][A-Za-z0-9_]*|\d+|[^A-Za-z0-9_]+/g, function (trozo) {
      if (esClave[trozo]) return envolver('sx-clave', trozo);
      if (/^\d+$/.test(trozo)) return envolver('sx-numero', trozo);
      return escapar(trozo);
    });
  }

  function resaltarLinea(linea) {
    var salida = '';
    var i = 0;
    var inicio = 0;
    while (i < linea.length) {
      var caracter = linea[i];
      if (caracter === '"') {
        salida += resaltarCodigo(linea.slice(inicio, i)) + envolver('sx-comentario', linea.slice(i));
        return salida;
      }
      if (caracter === "'" || caracter === '|') {
        var cierre = linea.indexOf(caracter, i + 1);
        if (cierre === -1) cierre = linea.length - 1;
        salida += resaltarCodigo(linea.slice(inicio, i)) + envolver('sx-texto', linea.slice(i, cierre + 1));
        i = cierre + 1;
        inicio = i;
        continue;
      }
      i++;
    }
    return salida + resaltarCodigo(linea.slice(inicio));
  }

  document.querySelectorAll('code[data-lenguaje="abap"]').forEach(function (bloque) {
    bloque.innerHTML = bloque.textContent.split('\n').map(resaltarLinea).join('\n');
  });

  /* Botones «Copiar» de los bloques de código */

  document.querySelectorAll('.codigo__copiar[data-copiar]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var bloque = boton.closest('.codigo').querySelector('pre code');
      copiar(bloque.textContent).then(function () {
        marcarCopiado(boton, 'Copiado ✓');
        avisar('Código copiado al portapapeles.', 'exito');
      }, function () {
        avisar('No se ha podido copiar. Selecciona el código a mano.', 'error');
      });
    });
  });

  /* Filtros de errores */

  var filtros = document.querySelectorAll('[data-filtro]');
  var errores = document.querySelectorAll('.error-item');
  var cuentaErrores = document.querySelector('[data-cuenta-errores]');

  filtros.forEach(function (filtro) {
    filtro.addEventListener('click', function () {
      var categoria = filtro.getAttribute('data-filtro');
      var visibles = 0;
      filtros.forEach(function (otro) {
        otro.setAttribute('aria-pressed', String(otro === filtro));
      });
      errores.forEach(function (item) {
        var mostrar = categoria === 'todos' || item.getAttribute('data-categoria') === categoria;
        item.classList.toggle('is-oculto', !mostrar);
        if (mostrar) visibles++;
      });
      if (cuentaErrores) cuentaErrores.textContent = String(visibles);
    });
  });

  /* Pestañas de snippets (patrón ARIA tabs con flechas) */

  var pestanas = Array.prototype.slice.call(document.querySelectorAll('.snippets__pestana'));

  function activarPestana(pestana, enfocar) {
    pestanas.forEach(function (otra) {
      var activa = otra === pestana;
      otra.setAttribute('aria-selected', String(activa));
      otra.tabIndex = activa ? 0 : -1;
      var panel = document.getElementById(otra.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('is-activo', activa);
    });
    if (enfocar) pestana.focus();
  }

  pestanas.forEach(function (pestana, indice) {
    pestana.addEventListener('click', function () {
      activarPestana(pestana, false);
    });
    pestana.addEventListener('keydown', function (evento) {
      var destino = null;
      if (evento.key === 'ArrowDown' || evento.key === 'ArrowRight') destino = pestanas[(indice + 1) % pestanas.length];
      if (evento.key === 'ArrowUp' || evento.key === 'ArrowLeft') destino = pestanas[(indice - 1 + pestanas.length) % pestanas.length];
      if (evento.key === 'Home') destino = pestanas[0];
      if (evento.key === 'End') destino = pestanas[pestanas.length - 1];
      if (!destino) return;
      evento.preventDefault();
      activarPestana(destino, true);
    });
  });

  if (pestanas.length) activarPestana(pestanas[0], false);

  /* Transacciones: buscador y copiar con un clic */

  var campoBusqueda = document.getElementById('buscar-transaccion');
  var tcodes = Array.prototype.slice.call(document.querySelectorAll('.tcode'));
  var cuentaTcodes = document.querySelector('[data-cuenta-tcodes]');
  var vacio = document.querySelector('.tcodes__vacio');

  function normalizar(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  if (campoBusqueda) {
    campoBusqueda.addEventListener('input', function () {
      var consulta = normalizar(campoBusqueda.value.trim());
      var visibles = 0;
      tcodes.forEach(function (tcode) {
        var texto = normalizar(tcode.textContent + ' ' + tcode.getAttribute('data-buscar'));
        var coincide = !consulta || texto.indexOf(consulta) !== -1;
        tcode.parentElement.hidden = !coincide;
        if (coincide) visibles++;
      });
      cuentaTcodes.textContent = String(visibles);
      vacio.hidden = visibles !== 0;
    });
  }

  tcodes.forEach(function (tcode) {
    tcode.addEventListener('click', function () {
      var codigo = tcode.getAttribute('data-copiar');
      copiar(codigo).then(function () {
        marcarCopiado(tcode);
        avisar(codigo + ' copiada. Pégala en la barra de comandos de SAP GUI.', 'exito');
      }, function () {
        avisar('No se ha podido copiar ' + codigo + '.', 'error');
      });
    });
  });

  /* Compartir: LinkedIn con la URL real y copiar enlace */

  var publicada = /^https?:$/.test(window.location.protocol);
  var urlActual = window.location.href.split('#')[0];

  document.querySelectorAll('[data-compartir-linkedin]').forEach(function (enlace) {
    if (publicada) enlace.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(urlActual);
  });

  document.querySelectorAll('[data-copiar-enlace]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      if (!publicada) {
        avisar('La guía aún no está publicada: súbela a internet y este botón copiará su dirección.', 'error');
        return;
      }
      copiar(urlActual).then(function () {
        marcarCopiado(boton, 'Enlace copiado ✓');
        avisar('Enlace copiado. Pégalo donde quieras.', 'exito');
      }, function () {
        avisar('No se ha podido copiar el enlace.', 'error');
      });
    });
  });
})();
