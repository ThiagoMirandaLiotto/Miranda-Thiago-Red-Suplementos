// Carga productos de demostración en la API (los datos viven en memoria y se
// pierden al reiniciar el backend). Uso, con la API iniciada:
//     node docs/cargar-demo.mjs
// Los precios son ficticios: sirven solo para mostrar el sitio con contenido.
// Las tres fotos de producto son recortes de una foto real del stock de la tienda
// (docs/marca/fotos) y se sirven desde frontend/public/img/productos.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:3000/api";

const productos = [
    {
        nombre: "True Made Whey Protein 930 g", marca: "ENA", idCategoria: 1, sabor: "Chocolate",
        precio: 38900, stock: 12, stockMinimo: 4, imagen: "/img/productos/ena-true-made-whey.webp",
        descripcion: "Proteína de suero de leche para la recuperación después de entrenar."
    },
    {
        nombre: "Platinum Whey Protein 908 g", marca: "Star Nutrition", idCategoria: 1, sabor: "Vainilla",
        precio: 41500, stock: 3, stockMinimo: 4, imagen: "/img/productos/star-platinum-whey.webp",
        descripcion: "Proteína de suero en polvo, fácil de mezclar con agua o leche."
    },
    {
        nombre: "Creatina monohidrato 300 g", marca: "Star Nutrition", idCategoria: 2, sabor: "Sin sabor",
        precio: 25000.50, stock: 10, stockMinimo: 3, imagen: "",
        descripcion: "Creatina monohidrato en polvo, sin sabor, para sumar a cualquier bebida."
    },
    {
        nombre: "Creatina micronizada 250 g", marca: "ENA", idCategoria: 2, sabor: "Sin sabor",
        precio: 23900, stock: 0, stockMinimo: 2, imagen: "",
        descripcion: "Creatina micronizada de disolución rápida."
    },
    {
        nombre: "Pre War 300 g", marca: "ENA", idCategoria: 3, sabor: "Frutos rojos",
        precio: 27900, stock: 6, stockMinimo: 2, imagen: "",
        descripcion: "Pre-entreno en polvo para tomar antes de la rutina."
    },
    {
        nombre: "Pump 3D Ripped 315 g", marca: "Star Nutrition", idCategoria: 3, sabor: "Limón",
        precio: 29500, stock: 4, stockMinimo: 2, imagen: "",
        descripcion: "Pre-entreno con sabor cítrico."
    },
    {
        nombre: "BCAA 2:1:1 300 g", marca: "Star Nutrition", idCategoria: 4, sabor: "Limón",
        precio: 21900, stock: 8, stockMinimo: 3, imagen: "",
        descripcion: "Aminoácidos de cadena ramificada en polvo."
    },
    {
        nombre: "Glutamina 300 g", marca: "Gentech", idCategoria: 4, sabor: "Sin sabor",
        precio: 19900, stock: 1, stockMinimo: 2, imagen: "",
        descripcion: "Glutamina en polvo, sin sabor."
    },
    {
        nombre: "Barra proteica caja x 12", marca: "Advance", idCategoria: 5, sabor: "Chocolate",
        precio: 26400, stock: 9, stockMinimo: 3, imagen: "/img/productos/advance-barra-proteica.webp",
        descripcion: "Caja de 12 barras proteicas para llevar al gimnasio."
    },
    {
        nombre: "Protein Bar", marca: "ENA", idCategoria: 5, sabor: "Cookies and cream",
        precio: 2400, stock: 40, stockMinimo: 10, imagen: "",
        descripcion: "Barra proteica individual."
    }
];

let creados = 0;
for (const producto of productos) {
    const response = await fetch(`${API_URL}/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto)
    });
    const resultado = await response.json();
    if (response.ok) {
        creados++;
        console.log(`Creado #${resultado.data.idProducto}: ${producto.nombre}`);
    } else {
        console.log(`Sin crear (${response.status}): ${producto.nombre}. ${resultado.message}`);
    }
}
console.log(`\n${creados} de ${productos.length} productos cargados en ${API_URL}.`);
