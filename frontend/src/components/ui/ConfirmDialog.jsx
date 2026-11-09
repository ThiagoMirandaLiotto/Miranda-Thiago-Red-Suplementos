import { useEffect, useId, useRef } from "react";
import Button from "./Button.jsx";
import styles from "./ConfirmDialog.module.css";

// Confirmación sobre <dialog> nativo: showModal() atrapa el foco, Esc cancela
// y el navegador devuelve el foco al botón que lo abrió.
export default function ConfirmDialog({
    open,
    titulo,
    children,
    confirmLabel,
    loadingLabel,
    loading = false,
    error,
    onConfirm,
    onCancel,
    onClosed
}) {
    const dialogRef = useRef(null);
    const cancelarRef = useRef(null);
    const tituloId = useId();
    const descripcionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (open && !dialog.open) {
            dialog.showModal();
            // Foco inicial en la opción segura.
            cancelarRef.current?.focus();
        }
        if (!open && dialog.open) {
            dialog.close();
            // Después de cerrar: quien lo usa puede mover el foco, por ejemplo
            // cuando el botón que abrió el diálogo ya no existe.
            onClosed?.();
        }
    }, [open, onClosed]);

    function handleCancel(event) {
        // Esc: el diálogo se cierra solo si no hay una operación en curso.
        event.preventDefault();
        if (!loading) onCancel();
    }

    function handleClick(event) {
        // Un clic en el fondo oscuro llega al propio <dialog>.
        if (event.target === dialogRef.current && !loading) onCancel();
    }

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            role="alertdialog"
            aria-labelledby={tituloId}
            aria-describedby={descripcionId}
            onCancel={handleCancel}
            onClose={() => {
                // Chrome puede cerrar el diálogo ante un segundo Esc: se sincroniza el estado.
                if (open && !loading) onCancel();
            }}
            onClick={handleClick}
        >
            <div className={styles.contenido}>
                <h2 id={tituloId} className={styles.titulo}>{titulo}</h2>
                <div id={descripcionId} className={styles.descripcion}>{children}</div>
                {error ? <p className={styles.error} role="alert">{error}</p> : null}
                <div className={styles.acciones}>
                    <Button ref={cancelarRef} variant="tonal" onClick={onCancel} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading} loadingText={loadingLabel}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </dialog>
    );
}
