const mostrarAlertaModal = (titulo, texto, icono) => {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonText: "Aceptar"
    });
};

const mostrarNotificacionRapida = (titulo, texto, icono) => {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        timer: 1600,
        showConfirmButton: false
    });
};

const pedirConfirmacionUsuario = async (titulo, texto, textoConfirmar) => {
    const respuestaModal = await Swal.fire({
        title: titulo,
        text: texto,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: textoConfirmar,
        cancelButtonText: "Cancelar"
    });
    return Boolean(respuestaModal.isConfirmed);
};

const actualizarBarraEtapa = (indicadorElemento, etapaActual) => {
    if (!indicadorElemento) {
        return;
    }

    indicadorElemento.classList.remove("etapa-uno", "etapa-dos", "etapa-tres");

    if (etapaActual === 1) {
        indicadorElemento.classList.add("etapa-uno");
    } else if (etapaActual === 2) {
        indicadorElemento.classList.add("etapa-dos");
    } else {
        indicadorElemento.classList.add("etapa-tres");
    }
};

const agregarEventoFeed = (listaElemento, mensajeAccion) => {
    if (!listaElemento) {
        return;
    }

    const horaActual = new Date().toLocaleTimeString();
    const elementoItem = document.createElement("li");
    elementoItem.textContent = `[${horaActual}] ${mensajeAccion}`;
    listaElemento.prepend(elementoItem);

    if (listaElemento.children.length > 5) {
        listaElemento.removeChild(listaElemento.lastChild);
    }
};