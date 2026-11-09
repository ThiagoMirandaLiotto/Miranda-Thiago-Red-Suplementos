// Regla del boceto para "Productos estrella": un destacado y una grilla
// de categorías distintas (el wireframe rotula Creatina, Pre-entreno y BCAA).
export function seleccionarDestacados(productos, cantidadGrilla = 3) {
    if (productos.length === 0) return { destacado: null, grilla: [] };

    const destacado = productos.find((producto) => producto.stock > 0) ?? productos[0];
    // sort es estable: entre productos con stock se respeta el orden de la API.
    const resto = productos
        .filter((producto) => producto.idProducto !== destacado.idProducto)
        .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));

    const grilla = [];
    const categoriasUsadas = new Set([destacado.idCategoria]);
    for (const producto of resto) {
        if (grilla.length === cantidadGrilla) break;
        if (!categoriasUsadas.has(producto.idCategoria)) {
            grilla.push(producto);
            categoriasUsadas.add(producto.idCategoria);
        }
    }
    // Si no alcanzan las categorías distintas, se completa con el resto.
    for (const producto of resto) {
        if (grilla.length === cantidadGrilla) break;
        if (!grilla.includes(producto)) grilla.push(producto);
    }

    return { destacado, grilla };
}
