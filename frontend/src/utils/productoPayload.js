import { parsePrecio } from "./validarProducto.js";

export const VALORES_INICIALES = Object.freeze({
    nombre: "",
    idCategoria: "",
    marca: "",
    sabor: "",
    precio: "",
    stock: "",
    stockMinimo: "",
    imagen: "",
    descripcion: ""
});

// Body que acepta la API: exactamente los 9 campos editables, con sus tipos.
// Nunca incluye idProducto ni activo (la API responde 400 si llegan).
export function toProductoPayload(valores) {
    const stockMinimo = valores.stockMinimo.trim();
    return {
        nombre: valores.nombre.trim(),
        marca: valores.marca.trim(),
        idCategoria: Number(valores.idCategoria),
        descripcion: valores.descripcion.trim(),
        precio: parsePrecio(valores.precio).valor,
        stock: Number(valores.stock.trim()),
        stockMinimo: stockMinimo === "" ? 0 : Number(stockMinimo),
        sabor: valores.sabor.trim(),
        imagen: valores.imagen.trim()
    };
}

// Convierte un producto de la API en los textos que muestra el formulario.
export function toFormValues(producto) {
    return {
        nombre: producto.nombre,
        idCategoria: String(producto.idCategoria),
        marca: producto.marca,
        sabor: producto.sabor,
        precio: String(producto.precio).replace(".", ","),
        stock: String(producto.stock),
        stockMinimo: String(producto.stockMinimo),
        imagen: producto.imagen,
        descripcion: producto.descripcion
    };
}
