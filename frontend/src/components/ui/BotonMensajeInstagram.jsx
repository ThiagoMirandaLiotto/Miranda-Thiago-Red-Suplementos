import Button from "./Button.jsx";
import InstagramIcon from "./InstagramIcon.jsx";
import { copiarAlPortapapeles, urlMensajeDirecto } from "../../utils/instagram.js";
import { notify } from "../../utils/notify.js";

// Abre el chat de Instagram de la tienda. Como Instagram no deja el texto escrito,
// el mensaje se copia antes y un aviso explica que hay que pegarlo.
// El nombre accesible empieza con el texto visible ("etiqueta") y suma el "detalle" (WCAG 2.5.3).
export default function BotonMensajeInstagram({ mensaje, etiqueta, detalle, variant = "primary", size = "md", fullWidth = false }) {
    async function alHacerClic() {
        if (await copiarAlPortapapeles(mensaje)) {
            notify.success("Copiamos tu mensaje", { description: "Pegalo en el chat de Instagram que se abrió." });
        } else {
            notify.info("Copiá este mensaje y pegalo en el chat", { description: mensaje, duration: 15000, closeButton: true });
        }
    }

    return (
        <Button
            href={urlMensajeDirecto()}
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            icon={<InstagramIcon />}
            onClick={alHacerClic}
            aria-label={`${etiqueta}${detalle ? `: ${detalle}` : ""}, por mensaje de Instagram (se abre en una pestaña nueva)`}
        >
            {etiqueta}
        </Button>
    );
}
