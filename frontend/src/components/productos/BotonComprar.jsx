import BotonMensajeInstagram from "../ui/BotonMensajeInstagram.jsx";
import { useSesion } from "../../hooks/useSesion.js";
import { ROL } from "../../utils/constants.js";
import { mensajeConsulta } from "../../utils/instagram.js";

// "Comprar" sigue siendo un mensaje directo de Instagram (así trabaja el local).
// Con sesión de cliente, el mensaje lleva su email para que el pedido quede en su cuenta.
export default function BotonComprar({ producto, size = "md", fullWidth = false }) {
    const { usuario } = useSesion();
    const sinStock = producto.stock === 0;
    const etiqueta = sinStock ? "Consultar disponibilidad" : "Comprar";
    const cuenta = usuario?.rol === ROL.CLIENTE ? usuario : null;

    return (
        <BotonMensajeInstagram
            mensaje={mensajeConsulta(producto, cuenta)}
            variant={sinStock ? "secondary" : "primary"}
            size={size}
            fullWidth={fullWidth}
            etiqueta={etiqueta}
            detalle={producto.nombre}
        />
    );
}
