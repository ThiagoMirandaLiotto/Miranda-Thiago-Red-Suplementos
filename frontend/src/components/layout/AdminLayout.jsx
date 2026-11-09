import { Link, NavLink, Outlet } from "react-router";
import { ArrowUpRight } from "lucide-react";
import SkipLink from "./SkipLink.jsx";
import Logo from "../ui/Logo.jsx";
import styles from "./AdminLayout.module.css";

// Barra oscura propia: el panel es una herramienta y se distingue del sitio público.
export default function AdminLayout() {
    return (
        <>
            <SkipLink />
            <header className={`${styles.barra} on-field`}>
                <Link to="/admin/productos" className={styles.marca}>
                    <Logo variante="compacto-negativo" alt="RED Suplementos, panel de productos" className={styles.logo} />
                </Link>
                <span className={styles.seccion}>Panel</span>
                <nav aria-label="Panel" className={styles.nav}>
                    <NavLink to="/admin/productos" end className={styles.link}>Productos</NavLink>
                    <Link to="/" className={styles.link}>
                        Ver tienda
                        <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                </nav>
            </header>
            <main id="contenido" tabIndex={-1} className={styles.main}>
                <Outlet />
            </main>
        </>
    );
}
