// Mismas reglas que valida la API (V-01, V-02, V-03 y V-07), con mensajes para quien completa el formulario.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^\d{8,15}$/;

// El teléfono se escribe como sea cómodo (con espacios o guiones) y se envía solo con dígitos.
export function limpiarTelefono(texto) {
    return texto.replace(/[\s()-]/g, "");
}

function validarNombre(texto, campo) {
    const limpio = texto.trim();
    if (limpio === "") return `Ingresá tu ${campo}.`;
    if (limpio.length > 60) return `Tu ${campo} puede tener hasta 60 caracteres.`;
    return null;
}

function validarTelefono(texto) {
    const limpio = limpiarTelefono(texto.trim());
    if (limpio === "") return "Ingresá un teléfono de contacto.";
    if (!/^\d+$/.test(limpio)) return "Usá solo números, por ejemplo 1123456789.";
    if (!TELEFONO.test(limpio)) return "El teléfono tiene que tener entre 8 y 15 números.";
    return null;
}

export function validarEmail(texto) {
    const limpio = texto.trim();
    if (limpio === "") return "Ingresá tu email.";
    if (!EMAIL.test(limpio)) return "Revisá el email: tiene que ser como nombre@dominio.com.";
    return null;
}

export function validarContrasena(texto) {
    if (texto === "") return "Creá una contraseña.";
    if (texto.length < 8) return "Usá al menos 8 caracteres.";
    if (texto.length > 128) return "La contraseña puede tener hasta 128 caracteres.";
    if (!/\p{L}/u.test(texto) || !/\d/.test(texto)) return "Combiná letras y números.";
    return null;
}

function conErrores(errores) {
    const limpios = Object.fromEntries(Object.entries(errores).filter(([, error]) => error));
    return { errores: limpios, valido: Object.keys(limpios).length === 0 };
}

export function validarRegistro(valores) {
    return conErrores({
        nombre: validarNombre(valores.nombre, "nombre"),
        apellido: validarNombre(valores.apellido, "apellido"),
        email: validarEmail(valores.email),
        telefono: validarTelefono(valores.telefono),
        contrasena: validarContrasena(valores.contrasena),
        confirmacion: valores.confirmacion === valores.contrasena ? null : "Las contraseñas no coinciden."
    });
}

export function validarPerfil(valores) {
    return conErrores({
        nombre: validarNombre(valores.nombre, "nombre"),
        apellido: validarNombre(valores.apellido, "apellido"),
        telefono: validarTelefono(valores.telefono)
    });
}

export function validarIngreso(valores) {
    return conErrores({
        email: valores.email.trim() === "" ? "Ingresá tu email." : null,
        contrasena: valores.contrasena === "" ? "Ingresá tu contraseña." : null
    });
}
