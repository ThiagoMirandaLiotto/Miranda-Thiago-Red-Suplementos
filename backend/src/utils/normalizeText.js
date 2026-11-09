export default function normalizeText(value) {
    return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
}
