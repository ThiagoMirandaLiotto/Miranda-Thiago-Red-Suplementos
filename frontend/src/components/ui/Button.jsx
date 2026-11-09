import { Link } from "react-router";
import Spinner from "./Spinner.jsx";
import styles from "./Button.module.css";

// Un solo componente para botones y enlaces con forma de botón:
// "to" navega dentro de la app, "href" sale del sitio y lo demás es un <button>.
export default function Button({
    variant = "primary",
    size = "md",
    to,
    href,
    loading = false,
    loadingText,
    icon,
    fullWidth = false,
    className = "",
    children,
    type = "button",
    disabled,
    ...props
}) {
    const clases = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : "",
        className
    ].join(" ");

    const contenido = (
        <>
            {loading ? <Spinner /> : icon}
            <span>{loading && loadingText ? loadingText : children}</span>
        </>
    );

    if (to) {
        return <Link to={to} className={clases} {...props}>{contenido}</Link>;
    }
    if (href) {
        return (
            <a href={href} className={clases} target="_blank" rel="noopener noreferrer" {...props}>
                {contenido}
                <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
            </a>
        );
    }
    return (
        <button
            type={type}
            className={clases}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {contenido}
        </button>
    );
}
