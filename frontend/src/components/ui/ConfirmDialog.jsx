import { useEffect, useId, useRef } from "react";
import Button from "./Button.jsx";
import styles from "./ConfirmDialog.module.css";

// Confirmación sobre <dialog> nativo: showModal() atrapa el foco, Esc cancela
// y el navegador devuelve el foco al botón que lo abrió.
// "campos" agrega un dato que la acción necesita (por ejemplo, el motivo de una cancelación):
// en ese caso el foco empieza en el campo y no en «Cancelar».
export default function ConfirmDialog({
    open,
    titulo,
    children,
    campos = null,
    confirmLabel,
    confirmVariant = "danger",
    cancelLabel = "Cancelar",
    loadingLabel,
    loading = false,
    error,
    onConfirm,
    onCancel,
    onClosed
}) {
    const dialogRef = useRef(null);
    const cancelarRef = useRef(null);
    const camposRef = useRef(null);
    const tituloId = useId();
    const descripcionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (open && !dialog.open) {
            dialog.showModal();
            // Foco inicial en el campo a completar o, si no hay, en la opción segura.
            const campo = camposRef.current?.querySelector("textarea, input, select");
            (campo ?? cancelarRef.current)?.focus();
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
                {campos ? <div ref={camposRef} className={styles.campos}>{campos}</div> : null}
                {error ? <p className={styles.error} role="alert">{error}</p> : null}
                <div className={styles.acciones}>
                    <Button ref={cancelarRef} variant="tonal" onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button variant={confirmVariant} onClick={onConfirm} loading={loading} loadingText={loadingLabel}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </dialog>
    );
}
