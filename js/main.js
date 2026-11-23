let planesCatalogo = [];
let adicionalesCatalogo = [];
let planSeleccionado = null;
let adicionalesElegidos = [];
let mesesContratacion = 1;
let descuentoCupon = 0;
let indiceEnEdicion = null;
let monedaSeleccionada = "ARS";
const tipoCambioUSD = 1500;

const textoEstado = document.getElementById("mensaje-estado");
const barraIndicador = document.getElementById("progreso-indicador");
const botonTema = document.getElementById("btn-cambiar-tema");
const botonAsistente = document.getElementById("btn-asistente");
const selectorMoneda = document.getElementById("select-moneda");
const buscadorPlanes = document.getElementById("input-buscar");
const grillaPlanes = document.getElementById("contenedor-planes");
const seccionAdicionales = document.getElementById("seccion-extras");
const listaAdicionales = document.getElementById("contenedor-extras");
const selectorMeses = document.getElementById("select-meses");
const zonaCarrito = document.getElementById("resumen-carrito");
const entradaCupon = document.getElementById("input-cupon");
const botonCupon = document.getElementById("btn-aplicar-cupon");
const textoTotal = document.getElementById("desglose-precio");
const botonContratar = document.getElementById("btn-contratar");
const botonGuardar = document.getElementById("btn-guardar-presupuesto");
const botonVaciar = document.getElementById("btn-vaciar-carrito");
const zonaHistorial = document.getElementById("contenedor-historial");
const botonLimpiarHistorial = document.getElementById("btn-limpiar-historial");
const listaFeed = document.getElementById("lista-feed");

const convertirMoneda = (montoPesos) => {
    if (monedaSeleccionada === "USD") {
        const valorDolares = montoPesos / tipoCambioUSD;
        const montoRedondeado = valorDolares.toFixed(2);
        return `U$S ${montoRedondeado}`;
    }
    const montoEntero = Math.round(montoPesos);
    return `$${montoEntero}`;
};

const calcularBonificacionMeses = (subtotalPeriodo, cantidadMeses) => {
    if (cantidadMeses === 12) {
        return subtotalPeriodo * 0.2;
    }
    if (cantidadMeses === 6) {
        return subtotalPeriodo * 0.1;
    }
    return 0;
};

const calcularResumenCompra = () => {
    if (!planSeleccionado) {
        return {
            subtotalMensual: 0,
            subtotalPeriodo: 0,
            bonificacionMeses: 0,
            bonificacionCupon: 0,
            totalPagar: 0
        };
    }

    const sumaExtrasMensual = adicionalesElegidos.reduce(
        (acumulador, extra) => acumulador + extra.precioMensual,
        0
    );
    const subtotalMensual = planSeleccionado.precioBase + sumaExtrasMensual;
    const subtotalPeriodo = subtotalMensual * mesesContratacion;
    const bonificacionMeses = calcularBonificacionMeses(subtotalPeriodo, mesesContratacion);
    const subtotalConPlazo = subtotalPeriodo - bonificacionMeses;
    const bonificacionCupon = subtotalConPlazo * descuentoCupon;
    const totalPagar = subtotalConPlazo - bonificacionCupon;

    return {
        subtotalMensual,
        subtotalPeriodo,
        bonificacionMeses,
        bonificacionCupon,
        totalPagar
    };
};

const cambiarVisibilidadAcciones = (mostrar) => {
    const acciones = [botonContratar, botonGuardar, botonVaciar];
    acciones.forEach((boton) => {
        if (!boton) {
            return;
        }
        if (mostrar) {
            boton.classList.remove("oculto");
        } else {
            boton.classList.add("oculto");
        }
    });
};

const dibujarCarrito = () => {
    if (!zonaCarrito || !textoTotal) {
        return;
    }

    if (!planSeleccionado) {
        zonaCarrito.innerHTML = `<p>No hay ninguna contratación en proceso. Elegí un plan para comenzar.</p>`;
        textoTotal.textContent = ``;
        cambiarVisibilidadAcciones(false);
        return;
    }

    const { nombre, precioBase } = planSeleccionado;
    const {
        subtotalPeriodo,
        bonificacionMeses,
        bonificacionCupon,
        totalPagar
    } = calcularResumenCompra();

    const precioBaseFormateado = convertirMoneda(precioBase);
    const subtotalFormateado = convertirMoneda(subtotalPeriodo);
    const descPlazoFormateado = convertirMoneda(bonificacionMeses);
    const descCuponFormateado = convertirMoneda(bonificacionCupon);
    const totalFormateado = convertirMoneda(totalPagar);
    const palabraMes = mesesContratacion === 1 ? "mes" : "meses";

    zonaCarrito.innerHTML = ``;

    const detalleCaja = document.createElement("div");
    detalleCaja.className = "item-carrito";

    const parrafoPlan = document.createElement("p");
    parrafoPlan.innerHTML = `<strong>Plan seleccionado:</strong> ${nombre} (${precioBaseFormateado}/mes)`;

    const parrafoPlazo = document.createElement("p");
    parrafoPlazo.innerHTML = `<strong>Plazo:</strong> ${mesesContratacion} ${palabraMes}`;

    const parrafoTituloExtras = document.createElement("p");
    parrafoTituloExtras.innerHTML = `<strong>Adicionales elegidos:</strong>`;

    const listaExtras = document.createElement("ul");
    if (adicionalesElegidos.length === 0) {
        const sinAdicionales = document.createElement("li");
        sinAdicionales.textContent = `Sin adicionales seleccionados`;
        listaExtras.appendChild(sinAdicionales);
    } else {
        adicionalesElegidos.forEach((extraItem) => {
            const itemExtra = document.createElement("li");
            const precioExtra = convertirMoneda(extraItem.precioMensual);
            itemExtra.textContent = `${extraItem.nombre} (+${precioExtra}/mes)`;
            listaExtras.appendChild(itemExtra);
        });
    }

    const parrafoSubtotal = document.createElement("p");
    parrafoSubtotal.textContent = `Subtotal del período: ${subtotalFormateado}`;

    detalleCaja.appendChild(parrafoPlan);
    detalleCaja.appendChild(parrafoPlazo);
    detalleCaja.appendChild(parrafoTituloExtras);
    detalleCaja.appendChild(listaExtras);
    detalleCaja.appendChild(parrafoSubtotal);

    if (bonificacionMeses > 0) {
        const lineaDescPlazo = document.createElement("p");
        lineaDescPlazo.textContent = `Bonificación por plazo: -${descPlazoFormateado}`;
        detalleCaja.appendChild(lineaDescPlazo);
    }

    if (bonificacionCupon > 0) {
        const lineaDescCupon = document.createElement("p");
        lineaDescCupon.textContent = `Descuento por cupón: -${descCuponFormateado}`;
        detalleCaja.appendChild(lineaDescCupon);
    }

    zonaCarrito.appendChild(detalleCaja);
    textoTotal.textContent = `Total a pagar: ${totalFormateado}`;
    cambiarVisibilidadAcciones(true);
    actualizarBarraEtapa(barraIndicador, 3);
};

const actualizarExtrasMarcados = () => {
    if (!listaAdicionales) {
        return;
    }

    const checkboxes = listaAdicionales.querySelectorAll("input[type='checkbox']");
    const idsMarcados = [];

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            const idExtra = checkbox.id.replace("extra-", "");
            idsMarcados.push(idExtra);
        }
    });

    adicionalesElegidos = adicionalesCatalogo.filter((extra) => idsMarcados.includes(String(extra.id)));
    dibujarCarrito();
    agregarEventoFeed(listaFeed, `Se actualizaron los adicionales del servicio.`);
};

const dibujarAdicionales = () => {
    if (!listaAdicionales) {
        return;
    }

    listaAdicionales.innerHTML = ``;

    adicionalesCatalogo.forEach((extraData) => {
        const { id, nombre, precioMensual } = extraData;
        const etiqueta = document.createElement("label");
        etiqueta.className = "opcion-adicional";

        const check = document.createElement("input");
        check.type = "checkbox";
        check.id = `extra-${id}`;
        check.checked = adicionalesElegidos.some((itemActivo) => itemActivo.id === id);
        check.addEventListener("change", actualizarExtrasMarcados);

        const textoExtra = document.createElement("span");
        const valorExtra = convertirMoneda(precioMensual);
        textoExtra.textContent = ` ${nombre} (+${valorExtra}/mes)`;

        etiqueta.appendChild(check);
        etiqueta.appendChild(textoExtra);
        listaAdicionales.appendChild(etiqueta);
    });
};

const filtrarPlanesCatalogo = () => {
    const textoRaw = buscadorPlanes ? buscadorPlanes.value.trim() : "";
    const consulta = textoRaw.toLowerCase();
    const planesFiltrados = planesCatalogo.filter((planItem) => {
        const nombreMinuscula = planItem.nombre.toLowerCase();
        const descMinuscula = planItem.descripcion.toLowerCase();
        const caractMinuscula = planItem.caracteristica.toLowerCase();
        return (
            nombreMinuscula.includes(consulta) ||
            descMinuscula.includes(consulta) ||
            caractMinuscula.includes(consulta)
        );
    });
    dibujarPlanes(planesFiltrados);
};

const elegirPlanBase = (planData, mantenerEdicion = false) => {
    planSeleccionado = planData;
    indiceEnEdicion = mantenerEdicion ? indiceEnEdicion : null;

    if (!mantenerEdicion) {
        adicionalesElegidos = [];
        mesesContratacion = 1;
        descuentoCupon = 0;
        if (selectorMeses) {
            selectorMeses.value = "1";
        }
        if (entradaCupon) {
            entradaCupon.value = "";
        }
    }

    if (seccionAdicionales) {
        seccionAdicionales.classList.remove("oculto");
        seccionAdicionales.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    filtrarPlanesCatalogo();
    dibujarAdicionales();
    dibujarCarrito();
    actualizarBarraEtapa(barraIndicador, 2);
    agregarEventoFeed(listaFeed, `Plan seleccionado: ${planData.nombre}.`);
};

const dibujarPlanes = (listaPlanes) => {
    if (!grillaPlanes) {
        return;
    }

    grillaPlanes.innerHTML = ``;

    if (listaPlanes.length === 0) {
        const mensajeVacio = document.createElement("p");
        mensajeVacio.textContent = `No hay planes que coincidan con tu búsqueda. Probá con otro término.`;
        grillaPlanes.appendChild(mensajeVacio);
        return;
    }

    listaPlanes.forEach((planItem) => {
        const { id, nombre, precioBase, descripcion, caracteristica } = planItem;
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-plan";

        const esActual = Boolean(planSeleccionado && planSeleccionado.id === id);
        if (esActual) {
            tarjeta.classList.add("tarjeta-seleccionada");
        }

        const titulo = document.createElement("h3");
        titulo.textContent = `${nombre}`;

        const desc = document.createElement("p");
        desc.textContent = `${descripcion}`;

        const caract = document.createElement("p");
        caract.textContent = `Incluye: ${caracteristica}`;

        const precio = document.createElement("p");
        precio.className = "precio-plan";
        precio.textContent = `${convertirMoneda(precioBase)} / mes`;

        const botonElegir = document.createElement("button");
        botonElegir.type = "button";
        botonElegir.textContent = esActual ? "Plan seleccionado" : "Seleccionar plan";
        botonElegir.addEventListener("click", () => {
            elegirPlanBase(planItem, false);
        });

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(desc);
        tarjeta.appendChild(caract);
        tarjeta.appendChild(precio);
        tarjeta.appendChild(botonElegir);
        grillaPlanes.appendChild(tarjeta);
    });
};

const dibujarHistorial = () => {
    if (!zonaHistorial) {
        return;
    }

    const presupuestos = obtenerPresupuestosGuardados();
    zonaHistorial.innerHTML = ``;

    if (presupuestos.length === 0) {
        zonaHistorial.innerHTML = `<p>No hay presupuestos guardados.</p>`;
        if (botonLimpiarHistorial) {
            botonLimpiarHistorial.classList.add("oculto");
        }
        return;
    }

    presupuestos.forEach((itemPresupuesto, indice) => {
        const { nombrePlan, meses, totalFormateado, fecha } = itemPresupuesto;
        const fila = document.createElement("div");
        fila.className = "item-historial";

        const palabraMes = meses === 1 ? "mes" : "meses";
        const textoResumen = document.createElement("span");
        textoResumen.textContent = `${nombrePlan} - ${meses} ${palabraMes} (${totalFormateado}) · ${fecha}`;

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "btn-secundario";
        botonEditar.textContent = `Modificar`;
        botonEditar.addEventListener("click", () => {
            const planEncontrado = planesCatalogo.find((plan) => plan.id === itemPresupuesto.idPlan);
            if (!planEncontrado) {
                mostrarAlertaModal("Aviso", "El plan de este presupuesto ya no está disponible.", "info");
                return;
            }

            indiceEnEdicion = indice;
            mesesContratacion = itemPresupuesto.meses;
            if (selectorMeses) {
                selectorMeses.value = String(mesesContratacion);
            }
            const idsGuardados = itemPresupuesto.idsAdicionales || [];
            adicionalesElegidos = adicionalesCatalogo.filter((extra) => idsGuardados.includes(extra.id));
            elegirPlanBase(planEncontrado, true);
            mostrarNotificacionRapida("Presupuesto cargado", "Editá los datos y guardá para actualizar.", "info");
        });

        const botonBorrar = document.createElement("button");
        botonBorrar.type = "button";
        botonBorrar.className = "btn-peligro";
        botonBorrar.textContent = `Borrar`;
        botonBorrar.addEventListener("click", () => {
            eliminarPresupuestoStorage(indice);
            if (indiceEnEdicion === indice) {
                indiceEnEdicion = null;
            }
            dibujarHistorial();
            agregarEventoFeed(listaFeed, `Se eliminó un presupuesto de ${nombrePlan}.`);
        });

        fila.appendChild(textoResumen);
        fila.appendChild(botonEditar);
        fila.appendChild(botonBorrar);
        zonaHistorial.appendChild(fila);
    });

    if (botonLimpiarHistorial) {
        botonLimpiarHistorial.classList.remove("oculto");
    }
};

const limpiarCarrito = () => {
    planSeleccionado = null;
    adicionalesElegidos = [];
    mesesContratacion = 1;
    descuentoCupon = 0;
    indiceEnEdicion = null;

    if (selectorMeses) {
        selectorMeses.value = "1";
    }
    if (entradaCupon) {
        entradaCupon.value = "";
    }
    if (seccionAdicionales) {
        seccionAdicionales.classList.add("oculto");
    }

    filtrarPlanesCatalogo();
    dibujarCarrito();
    actualizarBarraEtapa(barraIndicador, 1);
};

const validarYProcesarCupon = () => {
    if (!entradaCupon) {
        return;
    }

    const codigoNormalizado = entradaCupon.value.trim().toUpperCase();
    if (codigoNormalizado === "PROMO10") {
        descuentoCupon = 0.1;
        mostrarNotificacionRapida("Cupón aplicado", "10% de descuento activado.", "success");
    } else if (codigoNormalizado === "VIP20") {
        descuentoCupon = 0.2;
        mostrarNotificacionRapida("Cupón VIP aplicado", "20% de descuento activado.", "success");
    } else {
        descuentoCupon = 0;
        mostrarAlertaModal("Cupón inválido", "Verificá el código ingresado e intentá nuevamente.", "error");
    }

    if (planSeleccionado) {
        dibujarCarrito();
    }
};

const configurarEventos = () => {
    if (botonTema) {
        botonTema.addEventListener("click", () => {
            document.body.classList.toggle("modo-claro");
            agregarEventoFeed(listaFeed, `Se cambió el tema claro/oscuro.`);
        });
    }

    if (selectorMoneda) {
        selectorMoneda.addEventListener("change", (evento) => {
            monedaSeleccionada = evento.target.value;
            filtrarPlanesCatalogo();
            dibujarAdicionales();
            dibujarCarrito();
            agregarEventoFeed(listaFeed, `Moneda cambiada a ${monedaSeleccionada}.`);
        });
    }

    if (buscadorPlanes) {
        buscadorPlanes.addEventListener("input", () => {
            filtrarPlanesCatalogo();
        });
    }

    if (selectorMeses) {
        selectorMeses.addEventListener("change", (evento) => {
            mesesContratacion = parseInt(evento.target.value, 10);
            dibujarCarrito();
            agregarEventoFeed(listaFeed, `Plazo actualizado a ${mesesContratacion} mes(es).`);
        });
    }

    if (botonCupon) {
        botonCupon.addEventListener("click", () => {
            validarYProcesarCupon();
        });
    }

    if (entradaCupon) {
        entradaCupon.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                validarYProcesarCupon();
            }
        });
    }

    if (botonGuardar) {
        botonGuardar.addEventListener("click", () => {
            if (!planSeleccionado) {
                return;
            }

            const { totalPagar } = calcularResumenCompra();
            const nuevoRegistro = {
                idPlan: planSeleccionado.id,
                nombrePlan: planSeleccionado.nombre,
                meses: mesesContratacion,
                idsAdicionales: adicionalesElegidos.map((item) => item.id),
                totalFormateado: convertirMoneda(totalPagar),
                fecha: new Date().toLocaleDateString()
            };

            if (indiceEnEdicion !== null) {
                actualizarPresupuestoStorage(indiceEnEdicion, nuevoRegistro);
                indiceEnEdicion = null;
                mostrarNotificacionRapida("Presupuesto actualizado", "Los cambios se guardaron en el historial.", "success");
            } else {
                agregarPresupuestoStorage(nuevoRegistro);
                mostrarNotificacionRapida("Presupuesto guardado", "Se agregó al historial.", "success");
            }

            dibujarHistorial();
            agregarEventoFeed(listaFeed, `Presupuesto guardado: ${planSeleccionado.nombre}.`);
        });
    }

    if (botonVaciar) {
        botonVaciar.addEventListener("click", () => {
            limpiarCarrito();
            agregarEventoFeed(listaFeed, `Se vació el carrito.`);
        });
    }

    if (botonContratar) {
        botonContratar.addEventListener("click", () => {
            if (!planSeleccionado) {
                return;
            }

            const { totalPagar } = calcularResumenCompra();
            const palabraMes = mesesContratacion === 1 ? "mes" : "meses";
            const resumenAlta = `${planSeleccionado.nombre} por ${mesesContratacion} ${palabraMes} (${convertirMoneda(totalPagar)}).`;
            mostrarAlertaModal("¡Contratación confirmada!", resumenAlta, "success");
            agregarEventoFeed(listaFeed, `Contratación confirmada: ${planSeleccionado.nombre}.`);
            limpiarCarrito();
        });
    }

    if (botonLimpiarHistorial) {
        botonLimpiarHistorial.addEventListener("click", async () => {
            const aceptaBorrar = await pedirConfirmacionUsuario(
                "¿Borrar todo el historial?",
                "Se eliminarán todos los presupuestos guardados.",
                "Sí, borrar todo"
            );
            if (!aceptaBorrar) {
                return;
            }

            vaciarPresupuestosStorage();
            dibujarHistorial();
            agregarEventoFeed(listaFeed, `Se borró todo el historial de presupuestos.`);
        });
    }

    if (botonAsistente) {
        botonAsistente.addEventListener("click", async () => {
            if (planesCatalogo.length === 0) {
                return;
            }

            const { value: prioridad } = await Swal.fire({
                title: "¿Cuál es tu prioridad?",
                input: "select",
                inputOptions: {
                    inicial: "Presupuesto inicial accesible",
                    crecimiento: "Equilibrio para crecer",
                    potencia: "Máxima capacidad"
                },
                inputPlaceholder: "Elegí una opción",
                showCancelButton: true
            });

            if (!prioridad) {
                return;
            }

            let planSugerido = planesCatalogo[0];
            if (prioridad === "crecimiento" && planesCatalogo[1]) {
                planSugerido = planesCatalogo[1];
            } else if (prioridad === "potencia" && planesCatalogo[planesCatalogo.length - 1]) {
                planSugerido = planesCatalogo[planesCatalogo.length - 1];
            }

            elegirPlanBase(planSugerido, false);
            mostrarNotificacionRapida("Plan sugerido", `Seleccionamos "${planSugerido.nombre}".`, "info");
        });
    }
};

const iniciarAplicacion = async () => {
    configurarEventos();
    try {
        if (textoEstado) {
            textoEstado.textContent = `Cargando planes y adicionales...`;
        }
        const catalogo = await obtenerDatosCatalogo();
        planesCatalogo = catalogo.planes || [];
        adicionalesCatalogo = catalogo.adicionales || [];
        if (textoEstado) {
            textoEstado.textContent = `Catálogo cargado (${planesCatalogo.length} planes).`;
        }
        agregarEventoFeed(listaFeed, `Catálogo cargado correctamente.`);
    } catch (error) {
        if (textoEstado) {
            textoEstado.textContent = `No se pudo cargar el catálogo.`;
        }
        mostrarAlertaModal("Error al cargar datos", error.message, "error");
    } finally {
        dibujarPlanes(planesCatalogo);
        dibujarHistorial();
    }
};

iniciarAplicacion();