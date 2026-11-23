// Reglas fijas del local que usan los servicios (Análisis del Sistema, puntos 2 y 3).
export const Negocio = Object.freeze({
    // RN-03 y V-06: el local atiende todos los días de 7 a 22 h; las franjas de retiro duran una hora.
    horaApertura: 7,
    horaCierre: 22,
    diasMaximosAnticipacion: 30,
    // RN-06: un pedido no retirado vence 48 horas después del horario acordado.
    horasParaVencer: 48,
    // RN-09: descuento para socios de RED GYM con la membresía activa y verificada.
    descuentoSocios: 10,
    horasSesion: 8,
    maxProductosCarrito: 30,
    maxUnidadesMovimiento: 100000,
    prefijoCodigo: "RED"
});
