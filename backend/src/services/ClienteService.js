import { NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { Negocio } from "../enums/Negocio.js";
import { Rol } from "../enums/Rol.js";
import validateMembresia from "../utils/validateMembresia.js";
import { normalizeSearch } from "../utils/normalizeText.js";

// Clientes registrados, vistos por el administrador.
export default class ClienteService {
    constructor(usuarioRepository, pedidoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.pedidoRepository = pedidoRepository;
    }

    getAll({ busqueda = "" } = {}) {
        const texto = normalizeSearch(busqueda);
        const pedidos = this.pedidoRepository.findAll();
        return this.usuarioRepository.findAll()
            .filter((usuario) => usuario.rol === Rol.CLIENTE)
            .filter((cliente) => !texto || [cliente.nombre, cliente.apellido, cliente.email, cliente.telefono]
                .some((campo) => normalizeSearch(campo).includes(texto)))
            .sort((a, b) => a.apellido.localeCompare(b.apellido, "es") || a.nombre.localeCompare(b.nombre, "es"))
            .map((cliente) => ({
                ...cliente.toJSON(),
                cantidadPedidos: pedidos.filter((pedido) => pedido.idCliente === cliente.idUsuario).length
            }));
    }

    getById(idCliente) {
        const cliente = this.usuarioRepository.findById(idCliente);
        if (!cliente || cliente.rol !== Rol.CLIENTE || !cliente.activo) throw new NotFoundError(Messages.CLIENT_NOT_FOUND);
        return cliente;
    }

    // RN-09: el local verifica la membresía en RED GYM y recién ahí corresponde el 10 %.
    setMembership(idCliente, data) {
        const { membresiaActiva } = validateMembresia(data);
        const cliente = this.getById(idCliente);
        return this.usuarioRepository.update(idCliente, {
            ...cliente,
            esSocioGym: membresiaActiva ? true : cliente.esSocioGym,
            membresiaActiva,
            descuento: membresiaActiva ? Negocio.descuentoSocios : 0
        });
    }
}
