const fixtureContainer = document.getElementById("fixture");
const modal = document.getElementById("modal");
const contenidoModal = document.getElementById("contenidoModal");
const cerrarModal = document.getElementById("cerrarModal");

// Cerrar modal
cerrarModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Al abrir modal, usamos wikiMap si existe
function abrirModalWikipedia(nombreEstadio) {
  contenidoModal.innerHTML = "Cargando información...";
  modal.classList.remove("hidden");

  const query = wikiMap[nombreEstadio]
    ? wikiMap[nombreEstadio]
    : nombreEstadio.replace(/\s+/g, '_');

  fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
    .then(res => res.ok
      ? res.json()
      : // si falla en Español, intentamos en Inglés
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
          .then(r => {
            if (!r.ok) throw new Error();
            return r.json();
          })
    )
    .then(data => {
      contenidoModal.innerHTML = `
        <h3 class="text-lg font-bold mb-2">${data.title}</h3>
        ${data.thumbnail ? `<img src="${data.thumbnail.source}" class="mb-3 rounded" alt="${data.title}" />` : ''}
        <p class="text-sm text-gray-300">${data.extract}</p>
        <a href="${data.content_urls.desktop.page}" target="_blank" class="text-blue-400 underline block mt-3">Ver en Wikipedia</a>
      `;
    })
    .catch(() => {
      contenidoModal.innerHTML = `<p class="text-sm text-red-400">No se encontró información en Wikipedia para: <strong>${nombreEstadio}</strong></p>`;
    });
}

// Función para parsear fechas tipo "Sábado, 14 de junio de 2025"
function parsearFecha(fechaTexto) {
  const partes = fechaTexto.match(/\d{1,2} de [a-z]+ de \d{4}/i);
  return partes ? new Date(partes[0].replace('de', '').replace('de', '')) : null;
}

// Fecha actual y fecha de corte
const hoy = new Date();
const fechaCorte = new Date(hoy);
fechaCorte.setDate(fechaCorte.getDate() + 1);

// Dividimos fixture en fases
const faseGrupos = fixture.filter(dia => {
  const fecha = parsearFecha(dia.fecha);
  return fecha && fecha < fechaCorte;
});

const faseEliminatoria = fixture.filter(dia => {
  const fecha = parsearFecha(dia.fecha);
  return fecha && fecha >= fechaCorte;
});

// Función para renderizar los días de partido
function renderFixture(titulo, dias) {
  const seccionTitulo = document.createElement("h2");
  seccionTitulo.className = "text-2xl font-bold mt-10 mb-4 border-b border-gray-700 pb-2";
  seccionTitulo.textContent = titulo;
  fixtureContainer.appendChild(seccionTitulo);

  dias.forEach(dia => {
    const fechaTitulo = document.createElement("h3");
    fechaTitulo.className = "text-xl font-semibold mt-6 mb-2 border-b border-gray-600 pb-1";
    fechaTitulo.textContent = `🗓️ ${dia.fecha}`;
    fixtureContainer.appendChild(fechaTitulo);

    dia.partidos.forEach(partido => {
      const card = document.createElement("div");
      card.className = "bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition";

      card.innerHTML = `
        <div class="text-lg font-bold">${partido.equipo1} vs ${partido.equipo2}</div>
        <div class="text-sm text-gray-300 mt-1">
          🕒 ${partido.hora} - 
          🏟️ <span class="underline text-blue-400 cursor-pointer estadio">${partido.estadio}</span>
        </div>
        <div class="text-sm mt-1">Resultado: <span class="font-semibold">${partido.resultado}</span></div>
      `;

      fixtureContainer.appendChild(card);

      const estadioEl = card.querySelector(".estadio");
      estadioEl.addEventListener("click", () => abrirModalWikipedia(partido.estadio));
    });
  });
}

// Mostrar fases según fecha
renderFixture("Fase de Grupos", faseGrupos);
if (hoy >= fechaCorte) {
  renderFixture("Fase Eliminatoria", faseEliminatoria);
}
