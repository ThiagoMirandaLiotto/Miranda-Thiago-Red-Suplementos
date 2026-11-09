const precioEntero = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

const precioConDecimales = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

// $ 27.000 o $ 25.000,50: los decimales solo aparecen cuando existen.
export function formatPrecio(valor) {
    return Number.isInteger(valor) ? precioEntero.format(valor) : precioConDecimales.format(valor);
}

export function formatCantidad(cantidad, singular, plural) {
    return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}
