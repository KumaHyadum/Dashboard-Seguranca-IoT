import { db, ref, onValue, query, limitToLast } from "./firebase.js";

const caminho = "dispositivos/esp32-seguranca";

const ambientes = {
    garagem: document.getElementById("sensor-garagem"),
    estoque: document.getElementById("sensor-estoque"),
    areaCentral: document.getElementById("sensor-area-central")
};

const estadoSistema = document.getElementById ("estado-sistema");
const estadoDispositivo = document.getElementById("estado-dispositivo");
let ultimaAtualizacaoDispositivo = null;
let diferencaServidor = 0;
let conectadoFirebase = false;

function atualizarDispositivo() {
    const horarioValido = typeof ultimaAtualizacaoDispositivo === "number";

    const idade = Date.now() + diferencaServidor - ultimaAtualizacaoDispositivo;

    const esp32Conectado = conectadoFirebase && horarioValido && idade <= 45000;

    estadoConexao.textContent = esp32Conectado ? "Conectado ao Firebase." : "Desconectado do Firebase.";
}

setInterval(atualizarDispositivo, 1000);

onValue(ref(db, ".info/serverTimeOffset"), (snapshot) => {
    diferencaServidor = snapshot.val() || 0;
    atualizarDispositivo();
});

const estadoConexao = document.getElementById ("estado-conexao");
const listaLogs = document.getElementById ("lista-logs");
const logsVazios = document.getElementById ("logs-vazios");

function atualizarAmbiente(nome, movimento) {
    const cartao = ambientes[nome];
    if (!cartao) return;

    const status = cartao.querySelector(".status");

    if (movimento === true) {
        cartao.dataset.estado = "alerta";
        status.textContent = "⚠ Movimento detectado!";
    }
    else if (movimento === false){
        cartao.dataset.estado = "normal";
        status.textContent = "Sem movimento";
    }
    else {
        cartao.dataset.estado = "desconhecido";
        status.textContent = "Aguardando dados";
    }
}

function mostrarErro(erro) {
    estadoConexao.textContent = "Erro ao acessar  os dados.";
    console.error("Firebase:", erro.code, erro.message);
}

onValue(ref(db, ".info/connected"), (snapshot) => {
    conectadoFirebase = snapshot.val() === true;
    atualizarDispositivo();
});

onValue(ref(db, `${caminho}/sensores`), (snapshot) => {
    const sensores = snapshot.val() || {};

    atualizarAmbiente("garagem", sensores.garagem);
    atualizarAmbiente("estoque", sensores.estoque);
    atualizarAmbiente("areaCentral", sensores.areaCentral);
}, mostrarErro);

onValue(ref(db, `${caminho}/estado`), (snapshot) => {
    const estado = snapshot.val();

    estadoSistema.textContent =
        estado?.armado === true ? "Armado" :
        estado?.armado ===  false ? "Desarmado" :
            "Aguardando dados";

    const horario = estado?.ultimaAtualizacao;
    ultimaAtualizacaoDispositivo = horario;
    atualizarDispositivo();

    document.getElementById("ultima-atualizacao").textContent =
        typeof horario === "number"
            ? new Date(horario).toLocaleString("pt-BR")
            : "-";
}, mostrarErro);

const consultaLogs = query(
    ref(db, `${caminho}/logs`),
    limitToLast(50)
);

onValue(consultaLogs, (snapshot) => {
    listaLogs.replaceChildren();
    logsVazios.hidden = snapshot.exists();

    snapshot.forEach((registro) => {
        const evento = registro.val();
        const item = document.createElement("li");

        const horario = typeof evento.horario === "number"
            ? new Date(evento.horario).toLocaleString("pt-BR")
            : "Sem horário";

        item.textContent =
         `${horario} - ${evento.mensagem || "Evento sem descrição"}`;

        listaLogs.prepend(item);
    });
}, mostrarErro);
