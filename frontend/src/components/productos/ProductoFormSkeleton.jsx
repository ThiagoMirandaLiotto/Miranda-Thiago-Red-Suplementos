import Skeleton from "../ui/Skeleton.jsx";
import styles from "./ProductoForm.module.css";

// Forma del formulario mientras llegan las categorías o el producto a editar.
export default function ProductoFormSkeleton() {
    return (
        <div className={styles.form} role="status">
            <span className="visually-hidden">Cargando formulario…</span>
            <div className={styles.grupo}>
                <Skeleton width="30%" height="1.2rem" />
                <Skeleton height="48px" />
                <Skeleton height="48px" />
                <Skeleton width="60%" height="48px" />
            </div>
            <div className={styles.grupo}>
                <Skeleton width="25%" height="1.2rem" />
                <Skeleton height="48px" />
            </div>
            <Skeleton width="220px" height="56px" />
        </div>
    );
}
