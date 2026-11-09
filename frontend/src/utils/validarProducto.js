// Mismas reglas que valida la API (validateProducto.js del backend),
// con mensajes pensados para quien completa el formulario.
export const LIMITES = Object.freeze({
    nombre: 120,
    marca: 120,
    sabor: 120,
    descripcion: 2000,
    imagen: 2000,
    precioMaximo: 1_000_000_000
});

const ENTERO = /^\d+$/;
const URL_O_RUTA = /^(https?:\/\/|\/)\S+$/;
const SIN_MILES = "Escribí el precio sin separador de miles, por ejemplo 25000,50.";
const SOLO_NUMEROS = "Usá solo números, por ejemplo 25000,50.";

// Acepta "25000", "25000,50" o "25000.50". "25.000" se rechaza porque
// en Argentina se lee como veinticinco mil, no como veinticinco.
export function parsePrecio(texto) {
    const limpio = texto.trim().replace(/^\$\s*/, "");
    if (limpio === "") return { error: "Ingresá el precio." };
    if (!/^[\d.,]+$/.test(limpio)) return { error: SOLO_NUMEROS };

    const separadores = limpio.match(/[.,]/g) ?? [];
    if (separadores.length > 1) return { error: SIN_MILES };

    let normalizado = limpio;
    if (separadores.length === 1) {
        const [entero, decimales] = limpio.split(/[.,]/);
        if (entero === "" || decimales === "") {
            return { error: "Revisá el precio: falta un número antes o después de la coma." };
        }
        if (decimales.length === 3 && !entero.startsWith("0")) return { error: SIN_MILES };
        if (decimales.length > 2) return { error: "El precio admite hasta 2 decimales." };
        normalizado = `${entero}.${decimales}`;
    }

    const valor = Number(normalizado);
    if (!Number.isFinite(valor)) return { error: SOLO_NUMEROS };
    if (valor <= 0) return { error: "Ingresá un precio mayor a 0." };
    if (valor > LIMITES.precioMaximo) return { error: "El precio no puede superar $ 1.000.000.000." };
    return { valor };
}

function validarEntero(texto, { obligatorio, faltante, invalido }) {
    const limpio = texto.trim();
    if (limpio === "") return obligatorio ? faltante : null;
    if (!ENTERO.test(limpio)) return invalido;
    if (!Number.isSafeInteger(Number(limpio))) return "El número es demasiado grande.";
    return null;
}

function validarLargo(texto, limite) {
    return texto.trim().length > limite ? `Puede tener hasta ${limite} caracteres.` : null;
}

export function validarProducto(valores) {
    const errores = {};
    const nombre = valores.nombre.trim();

    if (nombre === "") errores.nombre = "Ingresá el nombre del producto.";
    else if (nombre.length > LIMITES.nombre) errores.nombre = `El nombre puede tener hasta ${LIMITES.nombre} caracteres.`;

    if (valores.idCategoria === "") errores.idCategoria = "Elegí una categoría.";

    const precio = parsePrecio(valores.precio);
    if (precio.error) errores.precio = precio.error;

    const stock = validarEntero(valores.stock, {
        obligatorio: true,
        faltante: "Ingresá el stock disponible.",
        invalido: "El stock tiene que ser un número entero, 0 o más."
    });
    if (stock) errores.stock = stock;

    const stockMinimo = validarEntero(valores.stockMinimo, {
        obligatorio: false,
        invalido: "El stock mínimo tiene que ser un número entero, 0 o más."
    });
    if (stockMinimo) errores.stockMinimo = stockMinimo;

    for (const campo of ["marca", "sabor", "descripcion"]) {
        const error = validarLargo(valores[campo], LIMITES[campo]);
        if (error) errores[campo] = error;
    }

    const imagen = valores.imagen.trim();
    if (imagen.length > LIMITES.imagen) {
        errores.imagen = `Puede tener hasta ${LIMITES.imagen} caracteres.`;
    } else if (imagen !== "" && !URL_O_RUTA.test(imagen)) {
        errores.imagen = "Ingresá una URL que empiece con https:// o una ruta que empiece con /.";
    }

    return { errores, valido: Object.keys(errores).length === 0 };
}
