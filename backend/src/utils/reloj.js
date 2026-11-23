// Fuente única de la hora actual para los servicios. En producción devuelve la hora real;
// las pruebas y los datos de demostración pueden fijarla para trabajar con fechas conocidas.
export function crearReloj(inicial = null) {
    let fija = inicial ? new Date(inicial) : null;
    return {
        ahora: () => (fija ? new Date(fija) : new Date()),
        fijar: (fecha) => {
            fija = new Date(fecha);
        },
        avanzarHoras: (horas) => {
            fija = new Date((fija ?? new Date()).getTime() + horas * 3_600_000);
        },
        liberar: () => {
            fija = null;
        }
    };
}
