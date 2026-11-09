import { Outlet, useLocation } from "react-router";
import SkipLink from "./SkipLink.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import styles from "./PublicLayout.module.css";

// El telón se vuelve a montar en cada pantalla: cubre el cambio y se corre con la inclinación del logo.
// No aparece cuando la página llega con una transición de imagen (ver EnlaceProducto).
export default function PublicLayout() {
    const { pathname, state } = useLocation();

    return (
        <div className={styles.sitio} data-sitio="publico">
            {/* Si la imagen viaja de la tarjeta a la página, el telón no la tapa. */}
            {state?.sinTelon ? null : <div key={pathname} className={styles.telon} aria-hidden="true" />}
            <SkipLink />
            <Navbar />
            <main id="contenido" tabIndex={-1} className={styles.main}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
