// Ids de la ayuda y del error que FieldShell renderiza debajo de cada campo.
export function describedBy(id, { hint, error }) {
    const ids = [hint ? `${id}-ayuda` : null, error ? `${id}-error` : null].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
}
