import styles from "./InstagramIcon.module.css";

// El glifo vive en assets/icons/instagram.svg y se pinta con currentColor mediante una máscara.
export default function InstagramIcon({ size = 18 }) {
    return <span className={styles.icono} style={{ width: size, height: size }} aria-hidden="true" />;
}
