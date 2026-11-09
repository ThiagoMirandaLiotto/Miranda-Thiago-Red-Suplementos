import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import Logo from "../ui/Logo.jsx";
import Button from "../ui/Button.jsx";
import InstagramIcon from "../ui/InstagramIcon.jsx";
import TextoRoll from "../ui/TextoRoll.jsx";
import { useBarraScroll } from "../../hooks/useBarraScroll.js";
import { NAV_LINKS } from "../../utils/constants.js";
import { urlMensajeDirecto } from "../../utils/instagram.js";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const [abierto, setAbierto] = useState(false);
    const { pathname } = useLocation();
    const menuId = useId();
    const barraRef = useRef(null);
    const botonRef = useRef(null);

    useBarraScroll(barraRef, { transparenteArriba: pathname === "/" && !abierto });

    useEffect(() => {
        if (!abierto) return undefined;
        function alPresionarTecla(event) {
            if (event.key === "Escape") {
                setAbierto(false);
                botonRef.current?.focus();
            }
        }
        // Con el menú abierto la página de atrás no se mueve.
        document.documentElement.style.overflow = "hidden";
        document.addEventListener("keydown", alPresionarTecla);
        return () => {
            document.documentElement.style.overflow = "";
            document.removeEventListener("keydown", alPresionarTecla);
        };
    }, [abierto]);

    const cerrar = () => setAbierto(false);

    return (
        <header ref={barraRef} className={`${styles.barra} on-field`} data-fondo="solido">
            <div className={styles.interior}>
                <Link to="/" className={styles.marca} onClick={cerrar}>
                    <Logo variante="compacto-negativo" alt="RED Suplementos, inicio" className={styles.logo} />
                </Link>

                <nav aria-label="Principal" className={styles.nav}>
                    <button
                        ref={botonRef}
                        type="button"
                        className={styles.menuBoton}
                        aria-expanded={abierto}
                        aria-controls={menuId}
                        onClick={() => setAbierto((valor) => !valor)}
                    >
                        {abierto ? "Cerrar" : "Menú"}
                    </button>
                    <ul id={menuId} className={styles.links} data-open={abierto}>
                        {NAV_LINKS.map(({ etiqueta, destino }, indice) => (
                            <li key={destino} style={{ "--i": indice }}>
                                {destino.includes("#") ? (
                                    <Link to={destino} className={styles.link} onClick={cerrar}>
                                        <TextoRoll>{etiqueta}</TextoRoll>
                                    </Link>
                                ) : (
                                    <NavLink to={destino} end={destino === "/"} className={styles.link} onClick={cerrar}>
                                        <TextoRoll>{etiqueta}</TextoRoll>
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                <Button href={urlMensajeDirecto()} icon={<InstagramIcon />} className={styles.cta}>
                    <span className={styles.ctaTexto}>Escribinos</span>
                    <span className={styles.ctaCorto}>Instagram</span>
                </Button>
            </div>
        </header>
    );
}
