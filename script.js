const temas = {
  frutas: ['🍓','🍓','🍌','🍌','🍍','🍍','🍇','🍇','🍉','🍉','🍊','🍊','🍏','🍏','🥝','🥝'],
  animales: ['🐶','🐶','🐱','🐱','🐸','🐸','🐢','🐢','🦊','🦊','🐰','🐰','🐻','🐻','🐼','🐼'],
  postres: ['🍩','🍩','🍰','🍰','🧁','🧁','🍪','🍪','🍫','🍫','🍦','🍦','🥧','🥧','🍮','🍮']
};

let emojis = [];
let flippedCards = [];
let lockBoard = false;
let intentos = 0;
let parejasEncontradas = 0;

let tiempo = 0;
let tiempoMax = 60;
let cronometro = null;

const board = document.getElementById('game-board');
const mensaje = document.getElementById('mensaje');
const reiniciar = document.getElementById('reiniciar');
const intentosSpan = document.getElementById('intentos');
const tiempoSpan = document.getElementById('tiempo');
const selectorTema = document.getElementById('tema');

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function beep(freq, dur = 200, vol = 0.3) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.value = vol;
  osc.start();
  setTimeout(() => osc.stop(), dur);
}

function iniciarTemporizador() {
  clearInterval(cronometro);
  tiempo = tiempoMax;
  tiempoSpan.textContent = tiempo;
  cronometro = setInterval(() => {
    tiempo--;
    tiempoSpan.textContent = tiempo;

    if (tiempo <= 10) {
      tiempoSpan.style.color = 'red';
    } else {
      tiempoSpan.style.color = '';
    }

    if (tiempo === 0) {
      clearInterval(cronometro);
      lockBoard = true;
      mensaje.innerHTML = `
        <p style="color: red;">⏳ ¡Tiempo agotado!</p>
        <button id="reiniciar">Volver a jugar</button>
      `;
      mensaje.classList.add('mostrar');
      mensaje.style.display = 'block';
      document.getElementById('reiniciar').addEventListener('click', crearCartas);
    }
  }, 1000);
}

function crearCartas() {
  board.innerHTML = '';
  flippedCards = [];
  lockBoard = false;
  intentos = 0;
  parejasEncontradas = 0;
  intentosSpan.textContent = 0;
  mensaje.classList.remove('mostrar');
  mensaje.style.display = 'none';

  emojis = [...temas[selectorTema.value]].sort(() => 0.5 - Math.random());
  iniciarTemporizador();

  emojis.forEach((emoji) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;

    const inner = document.createElement('div');
    inner.classList.add('card-inner');

    const front = document.createElement('div');
    front.classList.add('card-front');

    const back = document.createElement('div');
    back.classList.add('card-back');
    back.textContent = emoji;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    board.appendChild(card);

    card.addEventListener('click', () => voltearCarta(card));
  });
}

function voltearCarta(card) {
  if (lockBoard || card.classList.contains('flipped')) return;

  card.classList.add('flipped');
  beep(600);
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    intentos++;
    intentosSpan.textContent = intentos;

    const [c1, c2] = flippedCards;
    if (c1.dataset.emoji === c2.dataset.emoji) {
      parejasEncontradas++;
      flippedCards = [];
      beep(900);

      if (parejasEncontradas === emojis.length / 2) {
        clearInterval(cronometro);
        mensaje.innerHTML = `
          <p>🎉 ¡Felicidades! Completaste el juego.</p>
          <p>⏱️ Tiempo restante: ${tiempo}s</p>
          <button id="reiniciar">Volver a jugar</button>
        `;
        mensaje.classList.add('mostrar');
        mensaje.style.display = 'block';
        document.getElementById('reiniciar').addEventListener('click', crearCartas);
        beep(1200, 500, 0.5);
      }
    } else {
      lockBoard = true;
      beep(300);
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        flippedCards = [];
        lockBoard = false;
      }, 1000);
    }
  }
}

selectorTema.addEventListener('change', crearCartas);

// ✅ Esta línea inicia el juego cuando se carga la página
window.addEventListener('DOMContentLoaded', crearCartas);