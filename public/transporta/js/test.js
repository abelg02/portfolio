(function () {
  'use strict';

  var test = document.querySelector('[data-test]');
  if (!test) return;

  var formulario = test.querySelector('.test__form');
  var pasos = Array.prototype.slice.call(test.querySelectorAll('.test__paso'));
  var siguiente = test.querySelector('.test__siguiente');
  var resultado = test.querySelector('.test__resultado');
  var nota = test.querySelector('.test__nota');
  var veredicto = test.querySelector('.test__veredicto');
  var explicacion = test.querySelector('.test__explicacion');
  var correcciones = test.querySelector('.test__correcciones');
  var contador = test.querySelector('.test__contador');
  var barra = test.querySelector('.test__progreso');
  var cta = test.querySelector('[data-test-cta]');
  var reiniciar = test.querySelector('[data-test-reiniciar]');
  var ESPERA_AVANCE = 280;

  // Cada nivel recomienda por dónde seguir leyendo la guía.
  var NIVELES = [
    { minimo: 5, titulo: 'Nivel avanzado.', texto: 'Cinco de cinco. Lo tuyo es la etapa 5 de la ruta: RAP, ABAP Cloud y Clean ABAP.', destino: '#ruta', boton: 'Ver la ruta' },
    { minimo: 4, titulo: 'Nivel intermedio.', texto: 'Casi perfecto. Repasa el fallo y échale un ojo a los snippets de ABAP moderno.', destino: '#snippets', boton: 'Ir a los snippets' },
    { minimo: 2, titulo: 'Nivel junior.', texto: 'Tienes la base. Los errores típicos te van a ahorrar más de un dump.', destino: '#errores', boton: 'Ir a los errores' },
    { minimo: 0, titulo: 'Recién llegado.', texto: 'Perfecto para empezar: la traducción línea a línea y la chuleta de tipos son tu punto de partida.', destino: '#traduccion', boton: 'Empezar la guía' }
  ];

  var actual = 0;

  function mostrarPaso(indice, enfocar) {
    actual = indice;
    pasos.forEach(function (paso, i) {
      paso.classList.toggle('is-actual', i === indice);
    });
    contador.textContent = (indice + 1) + '/' + pasos.length;
    barra.style.setProperty('--avance', ((indice + 1) / pasos.length).toFixed(2));
    siguiente.hidden = !pasos[indice].querySelector('input:checked');
    if (enfocar) {
      var primera = pasos[indice].querySelector('input:checked') || pasos[indice].querySelector('input');
      primera.focus({ preventScroll: true });
    }
  }

  function crearCorreccion(paso, acierto) {
    var li = document.createElement('li');
    var texto = document.createElement('span');
    var pregunta = document.createElement('strong');
    pregunta.textContent = paso.querySelector('legend').textContent + ' ';
    texto.append(pregunta, paso.getAttribute('data-explicacion'));
    li.append(texto);
    if (acierto) li.classList.add('is-bien');
    return li;
  }

  function evaluar() {
    var aciertos = 0;
    correcciones.textContent = '';
    pasos.forEach(function (paso) {
      var marcada = paso.querySelector('input:checked');
      var acierto = Boolean(marcada && marcada.value === '1');
      if (acierto) aciertos++;
      else correcciones.append(crearCorreccion(paso, false));
    });

    var nivel = NIVELES.filter(function (n) { return aciertos >= n.minimo; })[0];
    nota.textContent = aciertos + ' de ' + pasos.length + ' aciertos';
    veredicto.textContent = nivel.titulo;
    veredicto.classList.toggle('test__veredicto--no', aciertos < 2);
    explicacion.textContent = nivel.texto;
    cta.setAttribute('href', nivel.destino);
    cta.firstChild.textContent = nivel.boton + ' ';
    correcciones.hidden = aciertos === pasos.length;

    formulario.hidden = true;
    resultado.hidden = false;
    contador.textContent = '✓';
    barra.style.setProperty('--avance', '1');
    resultado.focus({ preventScroll: true });
  }

  function avanzar() {
    if (!pasos[actual].querySelector('input:checked')) return;
    if (actual < pasos.length - 1) mostrarPaso(actual + 1, true);
    else evaluar();
  }

  // Con ratón se avanza al elegir; con teclado las flechas solo cambian la opción y se avanza con Intro o con el botón.
  formulario.addEventListener('click', function (evento) {
    if (evento.target.type !== 'radio' || evento.detail === 0) return;
    siguiente.hidden = false;
    window.setTimeout(avanzar, ESPERA_AVANCE);
  });

  formulario.addEventListener('change', function () {
    siguiente.hidden = false;
  });

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    avanzar();
  });

  reiniciar.addEventListener('click', function () {
    formulario.reset();
    formulario.hidden = false;
    resultado.hidden = true;
    mostrarPaso(0, true);
  });

  mostrarPaso(0, false);
})();
