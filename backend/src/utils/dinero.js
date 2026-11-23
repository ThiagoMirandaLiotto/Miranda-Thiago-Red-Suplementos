// Los importes se calculan en centavos (enteros) y se devuelven en pesos,
// para que sumar precios con decimales no acumule errores de redondeo.
export function aCentavos(pesos) {
    return Math.round(pesos * 100);
}

export function aPesos(centavos) {
    return centavos / 100;
}

export function porcentajeDe(centavos, porcentaje) {
    return Math.round((centavos * porcentaje) / 100);
}
