const botonNuevo = document.querySelector("#btn-danger");
const botonCarta = document.querySelector("#btn-success");
const botonDetener = document.querySelector("#btn-warning");
const cartasJugador = document.querySelector("#cartas-jugador");
const cartasComputadora = document.querySelector("#cartas-computadora");
const puntosJugador = document.querySelector("#puntos-jugador");
const puntosComputadora = document.querySelector("#puntos-computadora");
const mensaje = document.querySelector("#mensaje");

const tipos = ["C", "D", "H", "S"];
const especiales = ["A", "J", "Q", "K"];

let mazo = [];
let manoJugador = [];
let manoComputadora = [];
let partidaTerminada = false;
let computadoraRevelada = false;

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
	return {
		nombre,
		puntos,
		palo: tipo,
		imagen: `assets/cartas/${nombre}${tipo}.png`
	};
}

function sacarCarta() {
	return mazo.pop();
}

function calcularPuntos(mano) {
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

function mostrarCarta(carta, contenedor) {
    const imagen = document.createElement("img");

    imagen.src = `assets/cartas/${carta.nombre}${carta.palo}.png`;
    imagen.classList.add("carta");

    contenedor.appendChild(imagen);
}

function dibujarJuego() {
	cartasJugador.replaceChildren();
	cartasComputadora.replaceChildren();

	manoJugador.forEach((carta) => {
		cartasJugador.appendChild(crearElementoCarta(carta));
	});

	manoComputadora.forEach((carta, indice) => {
		if (computadoraRevelada || indice === 0) {
			cartasComputadora.appendChild(crearElementoCarta(carta));
		}
	});

	puntosJugador.textContent = calcularPuntos(manoJugador);
	puntosComputadora.textContent = computadoraRevelada
		? calcularPuntos(manoComputadora)
		: calcularPuntos([manoComputadora[0]]);
}

function iniciarJuego() {
	crearBaraja();
	manoJugador = [sacarCarta(), sacarCarta()];
	manoComputadora = [sacarCarta(), sacarCarta()];
	partidaTerminada = false;
	computadoraRevelada = false;
	mensaje.textContent = "";
	botonCarta.disabled = false;
	botonDetener.disabled = false;
	dibujarJuego();

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
		terminarJuego("Perdiste: te pasaste de 21.", false);
	}
}

function detenerJuego() {
	if (partidaTerminada) return;
	computadoraRevelada = true;

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

function terminarJuego(resultado, revelarComputadora = true) {
	partidaTerminada = true;
	computadoraRevelada = revelarComputadora;
	botonCarta.disabled = true;
	botonDetener.disabled = true;
	mensaje.textContent = resultado;
	dibujarJuego();
}

botonNuevo.addEventListener("click", iniciarJuego);
botonCarta.addEventListener("click", pedirCarta);
botonDetener.addEventListener("click", detenerJuego);

iniciarJuego();
