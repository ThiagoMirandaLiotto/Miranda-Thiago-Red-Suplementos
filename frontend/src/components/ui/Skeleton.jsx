import styles from "./Skeleton.module.css";

// Bloque de carga con la forma del contenido final, para que nada salte al llegar los datos.
export default function Skeleton({ width = "100%", height = "1em", ratio, className = "" }) {
    const estilo = ratio ? { width, aspectRatio: ratio } : { width, height };
    return <span className={`${styles.skeleton} ${className}`} style={estilo} aria-hidden="true" />;
}
