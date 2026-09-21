// Referencias a los elementos de la interfaz.
const botonNuevo = document.querySelector("#btn-danger");
const botonCarta = document.querySelector("#btn-success");
const botonDetener = document.querySelector("#btn-warning");
const cartasJugador = document.querySelector("#cartas-jugador");
const cartasComputadora = document.querySelector("#cartas-computadora");
const puntosJugador = document.querySelector("#puntos-jugador");
const puntosComputadora = document.querySelector("#puntos-computadora");
const mensaje = document.querySelector("#mensaje");

// Configuración de los palos y las cartas especiales.
const tipos = ["C", "D", "H", "S"];
const especiales = ["A", "J", "Q", "K"];

let mazo = [];
let manoJugador = [];
let manoComputadora = [];
let partidaTerminada = false;

function crearBaraja() {
	mazo = [];

	// Crea las cartas numeradas del 2 al 10 para cada tipo.
	for (let numero = 2; numero <= 10; numero++) {
		for (const tipo of tipos) {
			mazo.push(crearCarta(numero, tipo, numero));
		}
	}

	// Agrega las cartas especiales para cada tipo.
	for (const tipo of tipos) {
		for (const especial of especiales) {
			const puntos = especial === "A" ? 11 : 10;
			mazo.push(crearCarta(especial, tipo, puntos));
		}
	}

	mazo = _.shuffle(mazo);
}

function crearCarta(nombre, tipo, puntos) {
	// Cada carta incluye sus puntos y la ruta de su imagen.
	return {
		nombre,
		puntos,
		palo: tipo,
		imagen: `assets/cartas/${nombre}${tipo}.png`
	};
}

function sacarCarta() {
	// Si el mazo se agota, se arma una baraja nueva para poder seguir jugando.
	if (mazo.length === 0) {
		crearBaraja();
	}

	return mazo.pop();
}

function calcularPuntos(mano) {
	// Un as vale 11, pero baja a 1 si la mano supera 21.
	let total = mano.reduce((suma, carta) => suma + carta.puntos, 0);
	let ases = mano.filter((carta) => carta.nombre === "A").length;

	while (total > 21 && ases > 0) {
		total -= 10;
		ases--;
	}

	return total;
}

function crearElementoCarta(carta) {
	const imagen = document.createElement("img");
	imagen.className = "carta";
	imagen.alt = `${carta.nombre} de ${carta.palo}`;
	imagen.src = carta.imagen;

	return imagen;
}

function crearCartaOculta() {
	// Carta de revés (trasera) para ocultar la carta tapada del crupier.
	const carta = document.createElement("div");
	carta.className = "carta carta-oculta";
	carta.title = "Carta oculta";

	return carta;
}

function dibujarJuego() {
	// Redibuja las cartas y los puntos después de cada acción.
	cartasJugador.replaceChildren();
	cartasComputadora.replaceChildren();

	manoJugador.forEach((carta) => {
		cartasJugador.appendChild(crearElementoCarta(carta));
	});

	if (partidaTerminada) {
		// Al terminar la partida se muestran todas las cartas de la computadora.
		manoComputadora.forEach((carta) => {
			cartasComputadora.appendChild(crearElementoCarta(carta));
		});
		puntosComputadora.textContent = calcularPuntos(manoComputadora);
	} else {
		// Durante la partida solo se ve la primera carta del crupier;
		// la segunda (la carta tapada) permanece oculta.
		cartasComputadora.appendChild(crearElementoCarta(manoComputadora[0]));
		cartasComputadora.appendChild(crearCartaOculta());

		// Los puntos visibles solo cuentan las cartas descubiertas.
		puntosComputadora.textContent = calcularPuntos([manoComputadora[0]]);
	}

	puntosJugador.textContent = calcularPuntos(manoJugador);
}

function iniciarJuego() {
	crearBaraja();
	manoJugador = [sacarCarta(), sacarCarta()];
	manoComputadora = [sacarCarta(), sacarCarta()];
	partidaTerminada = false;
	mensaje.textContent = "";
	botonCarta.disabled = false;
	botonDetener.disabled = false;
	dibujarJuego();

	// Comprueba si algún jugador comienza con Blackjack.
	const puntosInicialesJugador = calcularPuntos(manoJugador);
	const puntosInicialesComputadora = calcularPuntos(manoComputadora);

	if (puntosInicialesJugador === 21 && puntosInicialesComputadora === 21) {
		terminarJuego("Empate: ambos tienen Blackjack.");
	} else if (puntosInicialesJugador === 21) {
		terminarJuego("Blackjack: ganaste.");
	} else if (puntosInicialesComputadora === 21) {
		terminarJuego("La computadora tiene Blackjack.");
	}
}

function pedirCarta() {
	if (partidaTerminada) return;

	manoJugador.push(sacarCarta());
	dibujarJuego();

	if (calcularPuntos(manoJugador) > 21) {
		terminarJuego("Perdiste: te pasaste de 21.");
	}
}

function detenerJuego() {
	if (partidaTerminada) return;

	// La computadora roba hasta alcanzar al menos 17 puntos.
	while (calcularPuntos(manoComputadora) < 17) {
		manoComputadora.push(sacarCarta());
	}

	const jugador = calcularPuntos(manoJugador);
	const computadora = calcularPuntos(manoComputadora);

	if (computadora > 21 || jugador > computadora) {
		terminarJuego("Ganaste.");
	} else if (jugador === computadora) {
		terminarJuego("Empate.");
	} else {
		terminarJuego("Perdiste.");
	}
}

function terminarJuego(resultado) {
	// Bloquea las acciones y muestra el resultado final.
	partidaTerminada = true;
	botonCarta.disabled = true;
	botonDetener.disabled = true;
	mensaje.textContent = resultado;
	dibujarJuego();
}

// Conecta cada botón con la acción correspondiente.
botonNuevo.addEventListener("click", iniciarJuego);
botonCarta.addEventListener("click", pedirCarta);
botonDetener.addEventListener("click", detenerJuego);

iniciarJuego();
