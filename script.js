/* =====================================================================
  BLOQUE A: VARIABLES
===================================================================== */
   /* ===== DATOS (separados de las funciones) ===== */
const cuadernos = [
  { nombre: "sencillo", costo: 2000, tiempo: 0.5 },
  { nombre: "personalizado", costo: 3000, tiempo: 0.75 }
];

const gastosf = [
  { concepto: "Alquiler de un espacio compartido", importe: 45000 },
  { concepto: "Abono de internet", importe: 15000 }
];

const VALORES_INICIALES = [40, 20];
const HORAS_INICIALES = 40;

// Identificador del temporizador: fuera de las funciones para conservarlo entre clics
let temporizadorAviso;

/* =====================================================================
  BLOQUE B: FUNCIONES
===================================================================== */

/* ===== FORMATO ===== */
function formatoPesos(n) {
  return "$ " + n;
}

function formatoHoras(n) {
  return n + (n === 1 ? " hora" : " horas");
}

/* ===== CÁLCULOS (no tocan el DOM) ===== */

// Suma los importes de todos los gastos fijos.
function calcularGastosFijos(lgastosf) {
  let total = 0;
  lgastosf.forEach(function (dgastosf) {
    total += dgastosf.importe;
  });
  return total;
}

// Costo variable de un cuaderno = cantidad × costo unitario.
function calcularCostoVariable(dcuadernos, cantidad) {
  return cantidad * dcuadernos.costo;
}

// Suma cantidad × tiempo unitario de cada cuaderno.
function calcularHorasNecesarias(lcuadernos, lcantidades) {
  let total = 0;
  for (let i = 0; i < lcuadernos.length; i++) {
    total += lcantidades[i] * lcuadernos[i].tiempo;
  }
  return total;
}

// Cuenta unidades completas con un ciclo while; la fracción sobrante se descarta.
function calcularCapacidad(dcuadernos, horasDisponibles) {
  let unidades = 0;
  while ((unidades + 1) * dcuadernos.tiempo <= horasDisponibles) {
    unidades++;
  }
  return unidades;
}

// Compara horas disponibles con necesarias y arma el mensaje según el caso.
function evaluarProduccion(lcantidades, horasNecesarias, horasDisponibles) {
  const diferencia = horasDisponibles - horasNecesarias;

  if (lcantidades[0] === 0 && lcantidades[1] === 0) {
    return {
      estado: "sin-produccion",
      texto: "Sin producción prevista: ambas cantidades son cero. Quedan " + formatoHoras(horasDisponibles) + "."
    };
  } else if (diferencia > 0) {
    return {
      estado: "sobra",
      texto: "Podés realizar la producción prevista. Te quedan " + formatoHoras(diferencia) + " disponibles."
    };
  } else if (diferencia === 0) {
    return {
      estado: "exacto",
      texto: "El tiempo alcanza exactamente para la producción prevista."
    };
  } else {
    return {
      estado: "falta",
      texto: "Falta tiempo: necesitás " + formatoHoras(-diferencia) + " más para completar la producción."
    };
  }
}

/* ===== LECTURA Y VALIDACIÓN ===== */

// Valida un campo: vacío, no numérico, negativo o decimal (si debe ser entero).
// Un campo vacío se comprueba ANTES de convertir, porque Number("") devuelve 0.
function validarCampo(texto, nombre, esEntero) {
  if (texto === "") {
    return { error: "En " + nombre + ": el dato está vacío." };
  }
  const numero = Number(texto);
  if (isNaN(numero)) {
    return { error: "En " + nombre + ": el dato no es un número válido." };
  }
  if (numero < 0) {
    return { error: "En " + nombre + ": no se admiten valores negativos." };
  }
  if (esEntero && numero % 1 !== 0) {
    return { error: "En " + nombre + ": ingresá un número entero, sin decimales." };
  }
  return { valor: numero };
}

// Lee los tres campos y devuelve los datos y la lista de errores.
function leerFormulario() {
  const errores = [];
  const datos = { cantidades: [] };

  for (let i = 0; i < cuadernos.length; i++) {
    const idCampo = "cantidad-" + i;
    const r = validarCampo(
      document.getElementById(idCampo).value,
      "la cantidad de cuadernos " + cuadernos[i].nombre + "s",
      true
    );
    if (r.error !== undefined) {
      errores[errores.length] = { campo: idCampo, mensaje: r.error };
    } else {
      datos.cantidades[i] = r.valor;
    }
  }

  const h = validarCampo(document.getElementById("horas").value, "las horas disponibles", false);
  if (h.error !== undefined) {
    errores[errores.length] = { campo: "horas", mensaje: h.error };
  } else {
    datos.horas = h.valor;
  }

  return { datos: datos, errores: errores };
}

/* ===== PRESENTACIÓN (solo textContent y style) ===== */

// Completa la lista de gastos fijos que ya está escrita en el HTML.
function mostrarGastosFijos() {
  for (let i = 0; i < gastosf.length; i++) {
    document.getElementById("fijo-" + i).textContent =
      `${gastosf[i].concepto}: ${formatoPesos(gastosf[i].importe)}`;
  }
  document.getElementById("total-fijo").textContent =
    `Total fijo: ${formatoPesos(calcularGastosFijos(gastosf))}`;
}

// Muestra el costo y el tiempo de cada modelo debajo de su campo.
function mostrarAyudas() {
  for (let i = 0; i < cuadernos.length; i++) {
    document.getElementById("ayuda-" + i).textContent =
      `${formatoPesos(cuadernos[i].costo)} en materiales · ${cuadernos[i].tiempo} h por unidad`;
  }
}

function cargarValoresIniciales() {
  for (let i = 0; i < cuadernos.length; i++) {
    document.getElementById("cantidad-" + i).value = VALORES_INICIALES[i];
  }
  document.getElementById("horas").value = HORAS_INICIALES;
}

// Vacía los mensajes de error y quita el borde rojo de los campos.
function limpiarErrores() {
  document.querySelectorAll(".error").forEach(function (mensaje) {
    mensaje.textContent = "";
  });
  document.querySelectorAll("input").forEach(function (campo) {
    campo.style.borderColor = "";
  });
}

// Vacía todos los resultados y deja el mensaje inicial.
function limpiarResultados() {
  document.querySelectorAll(".resultado").forEach(function (resultado) {
    resultado.textContent = "";
  });
  document.getElementById("res-estado").style.backgroundColor = "";
  document.getElementById("res-vacio").textContent =
    "Completá los datos y presioná Calcular para ver los gastos, las horas necesarias y la capacidad de producción.";
}

// Muestra cada error junto a su campo y retira los resultados anteriores.
function mostrarErrores(lerrores) {
  limpiarErrores();
  limpiarResultados();
  lerrores.forEach(function (derrores) {
    document.getElementById("error-" + derrores.campo).textContent = derrores.mensaje;
    document.getElementById(derrores.campo).style.borderColor = "red";
  });
}

// Color de fondo del estado (el texto es lo que lo explica; el color es apoyo).
function colorEstado(estado) {
  if (estado === "sobra") {
    return "#dff0d8";
  } else if (estado === "exacto") {
    return "#fff3cd";
  } else if (estado === "falta") {
    return "#f8d7da";
  } else {
    return "#e2e3e5";
  }
}

// Completa los resultados con template strings.
function mostrarResultados(r) {
  document.getElementById("res-vacio").textContent = "";

  document.getElementById("res-gasto").textContent = `Gasto mensual previsto: ${formatoPesos(r.gastoMensual)}`;
  document.getElementById("res-fijos").textContent = `Gastos fijos: ${formatoPesos(r.fijos)}`;

  for (let i = 0; i < cuadernos.length; i++) {
    document.getElementById("res-variable-" + i).textContent =
      `Materiales de los cuadernos ${cuadernos[i].nombre}s: ${formatoPesos(r.variables[i])}`;
  }
  document.getElementById("res-totalvariables").textContent =
    `Total de costos variables: ${formatoPesos(r.totalVariables)}`;

  document.getElementById("res-horas-nec").textContent = `Horas necesarias: ${r.horasNecesarias} h`;
  document.getElementById("res-horas-disp").textContent = `Horas disponibles: ${r.horasDisponibles} h`;

  const estado = document.getElementById("res-estado");
  estado.textContent = r.produccion.texto;
  estado.style.backgroundColor = colorEstado(r.produccion.estado);

  for (let i = 0; i < cuadernos.length; i++) {
    document.getElementById("res-cap-" + i).textContent =
      `${r.capacidades[i]} unidades de cuadernos ${cuadernos[i].nombre}s`;
  }

  document.getElementById("res-aclaracion-1").textContent =
    `Son dos posibilidades diferentes. Con ${formatoHoras(r.horasDisponibles)} podés fabricar hasta ${r.capacidades[0]} cuadernos ${cuadernos[0].nombre}s si dedicás todo el tiempo a ese modelo, o hasta ${r.capacidades[1]} cuadernos ${cuadernos[1].nombre}s si dedicás todo el tiempo al otro.`;
  document.getElementById("res-aclaracion-2").textContent =
    "Estas cantidades no se suman: cada cálculo utiliza las mismas horas disponibles. Si fabricás ambos modelos, tenés que repartir ese tiempo y comprobar que la suma de las horas necesarias no lo supere.";
}

/* ===== EVENTOS ===== */

// Se ejecuta al enviar el formulario: lee, valida, calcula y muestra.
function calcular(evento) {
  evento.preventDefault(); // procesa sin recargar la página
  const lectura = leerFormulario();

  if (lectura.errores.length > 0) { // datos inválidos: no se calcula
    mostrarErrores(lectura.errores);
    return;
  }
  limpiarErrores();

  const d = lectura.datos;
  const variables = [];
  const capacidades = [];
  let totalVariables = 0;

  for (let i = 0; i < cuadernos.length; i++) {
    variables[i] = calcularCostoVariable(cuadernos[i], d.cantidades[i]);
    totalVariables += variables[i];
    capacidades[i] = calcularCapacidad(cuadernos[i], d.horas);
  }

  const fijos = calcularGastosFijos(gastosf);
  const horasNecesarias = calcularHorasNecesarias(cuadernos, d.cantidades);

  mostrarResultados({
    fijos: fijos,
    variables: variables,
    totalVariables: totalVariables,
    gastoMensual: fijos + totalVariables,
    horasNecesarias: horasNecesarias,
    horasDisponibles: d.horas,
    produccion: evaluarProduccion(d.cantidades, horasNecesarias, d.horas),
    capacidades: capacidades
  });
}

// Muestra un aviso y lo retira a los 3 segundos.
function mostrarAvisoTemporal(mensaje) {
  clearTimeout(temporizadorAviso); // cancela la espera anterior
  $("#aviso").text(mensaje);
  temporizadorAviso = setTimeout(function () {
    $("#aviso").text(""); // la asignación queda dentro de la función
  }, 3000);
}

// Se ejecuta al presionar "Restablecer" (registrado con jQuery).
function restablecer() {
  cargarValoresIniciales();
  limpiarErrores();
  limpiarResultados();
  mostrarAvisoTemporal("Datos restablecidos");
}

/* ================================================================   
  BLOQUE C: EJECUCIÓN
se ejecuta una vez, cuando el navegador terminó de leer el HTML, gracias a "defer"
===================================================================== */
/* ===== INICIO ===== */ 
// Son llamadas con paréntesis: se ejecutan ahora, una por una y en ese orden.
mostrarGastosFijos();     // completa la lista de gastos fijos y el total
mostrarAyudas();          // muestra costo y tiempo de cada modelo
cargarValoresIniciales(); // pone 40, 20 y 40 en los campos
limpiarResultados();      // deja el mensaje inicial en el panel de resultados

/* Registrar los eventos (se registran ahora, se ejecutan después): 
Se ejecutarán cuando la persona envíe el formulario o haga clic en Restablecer.*/
document.getElementById("formulario").addEventListener("submit", calcular);
$("#btnRestablecer").on("click", restablecer);

//Para que $ funcione en la última línea, jQuery tiene que cargarse antes que script.js. Eso se cumple con el orden de las etiquetas <script> en el HTML, las dos con defer. Si en la consola aparece $ is not defined, revisá ese orden.
