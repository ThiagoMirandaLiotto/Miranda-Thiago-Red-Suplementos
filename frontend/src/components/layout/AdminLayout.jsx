import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { ArrowUpRight, LogOut } from "lucide-react";
import SkipLink from "./SkipLink.jsx";
import Logo from "../ui/Logo.jsx";
import { useSesion } from "../../hooks/useSesion.js";
import { notify } from "../../utils/notify.js";
import styles from "./AdminLayout.module.css";

const SECCIONES = [
    { etiqueta: "Pedidos", destino: "/admin/pedidos" },
    { etiqueta: "Productos", destino: "/admin/productos" },
    { etiqueta: "Clientes", destino: "/admin/clientes" },
    { etiqueta: "Reportes", destino: "/admin/reportes" }
];

// Barra oscura propia: el panel es una herramienta y se distingue del sitio público.
// En pantallas anchas las secciones van en la barra; en el teléfono, en una segunda fila.
export default function AdminLayout() {
    const { usuario, salir } = useSesion();
    const navigate = useNavigate();

    async function cerrarSesion() {
        await salir();
        notify.success("Cerraste la sesión del panel");
        navigate("/", { replace: true });
    }

    return (
        <>
            <SkipLink />
            <header className={`${styles.barra} on-field`}>
                <Link to="/admin/pedidos" className={styles.marca}>
                    <Logo variante="compacto-negativo" alt="RED Suplementos, panel del local" className={styles.logo} />
                </Link>
                <nav aria-label="Secciones del panel" className={styles.secciones}>
                    {SECCIONES.map(({ etiqueta, destino }) => (
                        <NavLink key={destino} to={destino} className={styles.seccion}>{etiqueta}</NavLink>
                    ))}
                </nav>
                <div className={styles.cuenta}>
                    <Link to="/" className={styles.link} aria-label="Ver tienda">
                        <span className={styles.textoAncho}>Ver tienda</span>
                        <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                    <button
                        type="button"
                        className={styles.link}
                        onClick={cerrarSesion}
                        aria-label={`Salir (sesión de ${usuario.nombre})`}
                    >
                        <span className={styles.textoAncho}>Salir</span>
                        <LogOut size={18} aria-hidden="true" />
                    </button>
                </div>
            </header>
            <main id="contenido" tabIndex={-1} className={styles.main}>
                <Outlet />
            </main>
        </>
    );
}
