const CLAVE_PRESUPUESTOS = "presupuestosGuardadosSimulador";

const obtenerDatosCatalogo = async () => {
    const respuesta = await fetch("./data.json");
    if (!respuesta.ok) {
        throw new Error("No se pudo cargar el archivo data.json.");
    }
    return await respuesta.json();
};

const obtenerPresupuestosGuardados = () => {
    const datosGuardados = localStorage.getItem(CLAVE_PRESUPUESTOS);
    return datosGuardados ? JSON.parse(datosGuardados) : [];
};

const guardarPresupuestosStorage = (listaPresupuestos) => {
    localStorage.setItem(CLAVE_PRESUPUESTOS, JSON.stringify(listaPresupuestos));
};

const agregarPresupuestoStorage = (nuevoPresupuesto) => {
    const presupuestos = obtenerPresupuestosGuardados();
    presupuestos.push(nuevoPresupuesto);
    guardarPresupuestosStorage(presupuestos);
    return presupuestos;
};

const actualizarPresupuestoStorage = (indicePresupuesto, presupuestoEditado) => {
    const presupuestos = obtenerPresupuestosGuardados();
    if (presupuestos[indicePresupuesto]) {
        presupuestos[indicePresupuesto] = presupuestoEditado;
        guardarPresupuestosStorage(presupuestos);
    }
    return presupuestos;
};

const eliminarPresupuestoStorage = (indiceEliminar) => {
    const presupuestos = obtenerPresupuestosGuardados();
    const presupuestosFiltrados = presupuestos.filter((presupuesto, posicion) => posicion !== indiceEliminar);
    guardarPresupuestosStorage(presupuestosFiltrados);
    return presupuestosFiltrados;
};

const vaciarPresupuestosStorage = () => {
    localStorage.removeItem(CLAVE_PRESUPUESTOS);
};