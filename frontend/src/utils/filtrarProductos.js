import { ESTADO_STOCK, estadoStock } from "./stock.js";

export const ORDENES = Object.freeze([
    { valor: "nombre", etiqueta: "Nombre (A–Z)" },
    { valor: "precio-asc", etiqueta: "Menor precio" },
    { valor: "precio-desc", etiqueta: "Mayor precio" }
]);

export const FILTROS_INICIALES = Object.freeze({
    busqueda: "",
    idCategoria: "",
    marca: "",
    soloConStock: false,
    soloStockBajo: false,
    orden: "nombre"
});

// "Proteína" y "proteina" tienen que coincidir al buscar.
export function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLocaleLowerCase("es")
        .replace(/\s+/g, " ")
        .trim();
}

function ordenarProductos(productos, orden) {
    const copia = [...productos];
    if (orden === "precio-asc") return copia.sort((a, b) => a.precio - b.precio);
    if (orden === "precio-desc") return copia.sort((a, b) => b.precio - a.precio);
    return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

// mapaCategorias (opcional) suma el nombre de la categoría a la búsqueda:
// "proteína" encuentra un "Whey Protein" aunque el nombre no lo diga.
export function filtrarProductos(productos, filtros, mapaCategorias = new Map()) {
    const termino = normalizarTexto(filtros.busqueda ?? "");
    const resultado = productos.filter((producto) => {
        if (filtros.idCategoria && producto.idCategoria !== Number(filtros.idCategoria)) return false;
        if (filtros.marca && producto.marca !== filtros.marca) return false;
        if (filtros.soloConStock && producto.stock === 0) return false;
        if (filtros.soloStockBajo && estadoStock(producto) === ESTADO_STOCK.DISPONIBLE) return false;
        if (termino === "") return true;
        const categoria = mapaCategorias.get(producto.idCategoria) ?? "";
        return normalizarTexto(`${producto.nombre} ${producto.marca} ${producto.sabor} ${categoria}`).includes(termino);
    });
    return ordenarProductos(resultado, filtros.orden);
}

export function marcasDisponibles(productos) {
    const marcas = new Set(productos.map((producto) => producto.marca).filter(Boolean));
    return [...marcas].sort((a, b) => a.localeCompare(b, "es"));
}

// Los filtros viven en la URL (?q=&categoria=&marca=&stock=1&orden=) para poder compartirlos.
const PARAMS = { busqueda: "q", idCategoria: "categoria", marca: "marca", orden: "orden" };

export function filtrosDesdeParams(params) {
    const filtros = { ...FILTROS_INICIALES };
    for (const [clave, param] of Object.entries(PARAMS)) {
        if (params.has(param)) filtros[clave] = params.get(param);
    }
    filtros.soloConStock = params.get("stock") === "1";
    filtros.soloStockBajo = params.get("stock") === "bajo";
    return filtros;
}

export function paramsDesdeFiltros(filtros) {
    const params = new URLSearchParams();
    for (const [clave, param] of Object.entries(PARAMS)) {
        if (filtros[clave] && filtros[clave] !== FILTROS_INICIALES[clave]) params.set(param, filtros[clave]);
    }
    if (filtros.soloConStock) params.set("stock", "1");
    if (filtros.soloStockBajo) params.set("stock", "bajo");
    return params;
}

export function hayFiltrosActivos(filtros) {
    return Object.keys(FILTROS_INICIALES)
        .filter((clave) => clave !== "orden")
        .some((clave) => filtros[clave] !== FILTROS_INICIALES[clave]);
}
