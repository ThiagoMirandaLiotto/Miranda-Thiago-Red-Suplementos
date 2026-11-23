export default function normalizeText(value) {
    return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
}

// Para búsquedas: además ignora los acentos ("sofi" encuentra a "Sofía").
export function normalizeSearch(value) {
    return normalizeText(value).normalize("NFD").replace(/\p{Diacritic}/gu, "");
}
