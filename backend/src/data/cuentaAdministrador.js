// Cuenta del dueño del local. No hay registro público de administradores: la cuenta se crea al iniciar la API.
// Para usar otros datos: variables de entorno ADMIN_EMAIL y ADMIN_CONTRASENA.
export const ADMIN_POR_DEFECTO = Object.freeze({
    email: "admin@redsuplementos.com",
    contrasena: "RedAdmin2026",
    nombre: "Administrador",
    apellido: "RED Suplementos"
});

export function cuentaAdministrador(entorno = process.env) {
    return {
        ...ADMIN_POR_DEFECTO,
        email: entorno.ADMIN_EMAIL ?? ADMIN_POR_DEFECTO.email,
        contrasena: entorno.ADMIN_CONTRASENA ?? ADMIN_POR_DEFECTO.contrasena
    };
}
