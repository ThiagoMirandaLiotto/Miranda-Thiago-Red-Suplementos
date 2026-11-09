import Button from "../ui/Button.jsx";
import InstagramIcon from "../ui/InstagramIcon.jsx";
import { copiarAlPortapapeles, mensajeConsulta, urlMensajeDirecto } from "../../utils/instagram.js";
import { notify } from "../../utils/notify.js";

// "Comprar" abre el chat de Instagram. Como Instagram no deja el texto escrito,
// la consulta se copia antes y un aviso explica que hay que pegarla.
export default function BotonComprar({ producto, size = "md", fullWidth = false }) {
    const sinStock = producto.stock === 0;
    const etiqueta = sinStock ? "Consultar disponibilidad" : "Comprar";

    async function alHacerClic() {
        const mensaje = mensajeConsulta(producto);
        if (await copiarAlPortapapeles(mensaje)) {
            notify.success("Copiamos tu consulta", { description: "Pegala en el chat de Instagram que se abrió." });
        } else {
            notify.info("Copiá esta consulta y pegala en el chat", { description: mensaje, duration: 15000, closeButton: true });
        }
    }

    return (
        <Button
            href={urlMensajeDirecto()}
            variant={sinStock ? "secondary" : "primary"}
            size={size}
            fullWidth={fullWidth}
            icon={<InstagramIcon />}
            onClick={alHacerClic}
            aria-label={`${etiqueta}: ${producto.nombre}, por mensaje de Instagram (se abre en una pestaña nueva)`}
        >
            {etiqueta}
        </Button>
    );
}
