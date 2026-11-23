// Datos del negocio: única fuente para la navegación, el footer y los llamados a la acción.
export const NEGOCIO = Object.freeze({
    nombre: "RED Suplementos",
    gimnasio: "RED GYM",
    direccion: "Rogelio Yrurtia 6028",
    localidad: "Saavedra, CABA",
    mapaUrl: "https://www.google.com/maps/search/?api=1&query=Rogelio%20Yrurtia%206028%2C%20Saavedra%2C%20CABA",
    horario: Object.freeze({
        apertura: 7,
        cierre: 22,
        texto: "Todos los días, de 7 a 22 h"
    }),
    zonaHoraria: "America/Argentina/Buenos_Aires",
    descuentoSocios: 10,
    // Mismas reglas que valida la API (RN-03 y V-06): franjas de una hora y hasta 30 días de anticipación.
    diasMaximosAnticipacion: 30
});

// Perfiles de la API (Análisis del Sistema, punto 4).
export const ROL = Object.freeze({
    CLIENTE: "CLIENTE",
    ADMINISTRADOR: "ADMINISTRADOR"
});

// Pantalla de llegada después de ingresar, según el perfil.
export function inicioSegunRol(rol) {
    return rol === ROL.ADMINISTRADOR ? "/admin/pedidos" : "/mi-cuenta";
}

export const INSTAGRAM = Object.freeze({
    tienda: Object.freeze({ usuario: "redsuplementos_" }),
    gimnasio: Object.freeze({ usuario: "redgym_ba" })
});

export const NAV_LINKS = Object.freeze([
    { etiqueta: "Inicio", destino: "/" },
    { etiqueta: "Nosotros", destino: "/#nosotros" },
    { etiqueta: "Productos", destino: "/catalogo" },
    { etiqueta: "Contacto", destino: "#contacto" }
]);
