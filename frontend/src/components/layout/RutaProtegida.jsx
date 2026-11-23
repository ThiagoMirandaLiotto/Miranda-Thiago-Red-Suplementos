import { Navigate, useLocation } from "react-router";
import Spinner from "../ui/Spinner.jsx";
import { useSesion } from "../../hooks/useSesion.js";
import { inicioSegunRol } from "../../utils/constants.js";
import styles from "./RutaProtegida.module.css";

// RN-02 y RN-10 en la interfaz: sin sesión lleva a «Ingresar» (y vuelve después);
// con otro perfil lleva a su propio inicio. La API controla lo mismo en cada solicitud.
export default function RutaProtegida({ rol, children }) {
    const { status, usuario } = useSesion();
    const { pathname, search } = useLocation();

    if (status === "cargando") {
        return (
            <div className={styles.verificando} role="status">
                <Spinner size={22} />
                <span>Verificando tu sesión…</span>
            </div>
        );
    }
    if (status !== "autenticado") {
        return <Navigate to="/ingresar" replace state={{ desde: `${pathname}${search}` }} />;
    }
    if (usuario.rol !== rol) return <Navigate to={inicioSegunRol(usuario.rol)} replace />;
    return children;
}
