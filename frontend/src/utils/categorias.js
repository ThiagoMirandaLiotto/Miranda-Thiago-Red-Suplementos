// Los productos solo traen idCategoria: el nombre se resuelve con la lista de la API.
export function crearMapaCategorias(categorias) {
    return new Map(categorias.map((categoria) => [categoria.idCategoria, categoria.nombre]));
}

export function nombreCategoria(mapaCategorias, idCategoria) {
    return mapaCategorias.get(idCategoria) ?? "Sin categoría";
}
