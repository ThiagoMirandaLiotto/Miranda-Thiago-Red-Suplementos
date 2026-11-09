import { CircleAlert, RefreshCw } from "lucide-react";
import Button from "./Button.jsx";
import { mensajeDeError } from "../../utils/notify.js";
import styles from "./States.module.css";

// Error de carga en la pantalla, además del aviso lateral: deja una salida (Reintentar).
export default function ErrorState({ titulo, error, onRetry, as: Titulo = "h2" }) {
    return (
        <div className={styles.estado} data-tono="error">
            <div className={styles.icono} aria-hidden="true"><CircleAlert size={28} /></div>
            <Titulo className={styles.titulo}>{titulo}</Titulo>
            <p className={styles.texto}>{mensajeDeError(error)}</p>
            {onRetry ? (
                <div className={styles.accion}>
                    <Button variant="secondary" icon={<RefreshCw size={18} aria-hidden="true" />} onClick={onRetry}>
                        Reintentar
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
