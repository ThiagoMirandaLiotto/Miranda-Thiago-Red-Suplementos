import { randomBytes } from "node:crypto";
import { ConflictError, UnauthorizedError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { Negocio } from "../enums/Negocio.js";
import { Rol } from "../enums/Rol.js";
import validateRegistro from "../utils/validateRegistro.js";
import validateLogin from "../utils/validateLogin.js";
import validatePerfil from "../utils/validatePerfil.js";
import { contrasenaValida, leerEmail } from "../utils/validarCuerpo.js";
import { hashContrasena, verificarContrasena } from "../utils/contrasena.js";

// Con un email inexistente también se calcula un hash: la respuesta tarda lo mismo
// y no revela qué cuentas existen.
const HASH_SENUELO = hashContrasena("contrasena-que-no-pertenece-a-nadie-1");

// F-01: registro de clientes, inicio y cierre de sesión, y datos personales.
export default class AuthService {
    constructor(usuarioRepository, sesionRepository, reloj) {
        this.usuarioRepository = usuarioRepository;
        this.sesionRepository = sesionRepository;
        this.reloj = reloj;
    }

    // Crea la cuenta sin abrir sesión (la usan el registro y los datos de demostración).
    registerClient(data) {
        const datos = validateRegistro(data);
        if (this.usuarioRepository.findByEmail(datos.email)) throw new ConflictError(Messages.EMAIL_TAKEN); // RN-07
        return this.usuarioRepository.create({
            nombre: datos.nombre,
            apellido: datos.apellido,
            email: datos.email,
            telefono: datos.telefono,
            contrasena: hashContrasena(datos.contrasena),
            fechaAlta: this.reloj.ahora().toISOString(),
            activo: true,
            rol: Rol.CLIENTE,
            // La membresía se declara al registrarse y la verifica el local (RN-09).
            esSocioGym: datos.esSocioGym,
            membresiaActiva: false,
            descuento: 0
        });
    }

    register(data) {
        return this.#openSession(this.registerClient(data));
    }

    login(data) {
        const { email, contrasena } = validateLogin(data);
        const usuario = this.usuarioRepository.findByEmail(email);
        const coincide = verificarContrasena(contrasena, usuario?.contrasena ?? HASH_SENUELO);
        if (!usuario || !coincide || !usuario.activo) throw new UnauthorizedError(Messages.INVALID_CREDENTIALS);
        if (!usuario.esAdministrador()) return this.#openSession(usuario);
        const actualizado = this.usuarioRepository.update(usuario.idUsuario, {
            ...usuario,
            fechaUltimoAcceso: this.reloj.ahora().toISOString()
        });
        return this.#openSession(actualizado);
    }

    logout(token) {
        this.sesionRepository.delete(token);
        return { sesionCerrada: true };
    }

    // Devuelve el usuario de un token vigente, o null si no existe, venció o la cuenta está inactiva.
    authenticate(token) {
        const sesion = this.sesionRepository.findByToken(token);
        if (!sesion) return null;
        const usuario = this.usuarioRepository.findById(sesion.idUsuario);
        if (sesion.vencida(this.reloj.ahora()) || !usuario?.activo) {
            this.sesionRepository.delete(token);
            return null;
        }
        return usuario;
    }

    // Si el cliente cambia lo que declara sobre su membresía, el local tiene que volver a verificarla.
    updateProfile(usuario, data) {
        const datos = validatePerfil(data);
        const cambioMembresia = datos.esSocioGym !== usuario.esSocioGym;
        return this.usuarioRepository.update(usuario.idUsuario, {
            ...usuario,
            ...datos,
            membresiaActiva: cambioMembresia ? false : usuario.membresiaActiva,
            descuento: cambioMembresia ? 0 : usuario.descuento
        });
    }

    // La cuenta del dueño no se registra desde la web: se crea al iniciar la API (ver data/cuentaAdministrador.js).
    ensureAdmin({ email, contrasena, nombre, apellido }) {
        const emailValido = leerEmail(email);
        if (!emailValido || !contrasenaValida(contrasena)) throw new Error(Messages.INVALID_ADMIN_CONFIG);
        const existente = this.usuarioRepository.findByEmail(emailValido);
        if (existente) return existente;
        return this.usuarioRepository.create({
            nombre,
            apellido,
            email: emailValido,
            telefono: "",
            contrasena: hashContrasena(contrasena),
            fechaAlta: this.reloj.ahora().toISOString(),
            activo: true,
            rol: Rol.ADMINISTRADOR
        });
    }

    #openSession(usuario) {
        const ahora = this.reloj.ahora();
        const sesion = this.sesionRepository.create({
            token: randomBytes(32).toString("base64url"),
            idUsuario: usuario.idUsuario,
            creada: ahora.toISOString(),
            expira: new Date(ahora.getTime() + Negocio.horasSesion * 3_600_000).toISOString()
        });
        return { usuario, token: sesion.token, expira: sesion.expira };
    }
}
