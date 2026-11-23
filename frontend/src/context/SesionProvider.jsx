import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SesionContext } from "./sesion.js";
import { alVencerLaSesion, guardarToken, hayTokenGuardado } from "../services/apiClient.js";
import { cerrarSesion, getSesion, iniciarSesion, registrarse } from "../services/authService.js";
import { notify } from "../utils/notify.js";

const INVITADO = Object.freeze({ status: "invitado", usuario: null });

export default function SesionProvider({ children }) {
    const [sesion, setSesion] = useState(() => (hayTokenGuardado() ? { status: "cargando", usuario: null } : INVITADO));
    const cerrandoRef = useRef(false);

    // Con un token guardado, la API confirma de quién es antes de mostrar una pantalla privada.
    useEffect(() => {
        if (sesion.status !== "cargando") return undefined;
        const controller = new AbortController();
        getSesion(controller.signal)
            .then((usuario) => setSesion({ status: "autenticado", usuario }))
            .catch((error) => {
                if (controller.signal.aborted) return;
                // Si no hay conexión, el token se conserva para la próxima visita.
                setSesion(INVITADO);
                if (error.status === 0) notify.error(error, { id: "carga-sesion" });
            });
        return () => controller.abort();
    }, [sesion.status]);

    // Si la API rechaza el token en cualquier pantalla, la sesión se cierra en toda la app.
    useEffect(() => alVencerLaSesion((mensaje) => {
        setSesion(INVITADO);
        if (!cerrandoRef.current) notify.info(mensaje ?? "Tu sesión venció. Volvé a iniciar sesión.", { id: "sesion-vencida" });
    }), []);

    const abrir = useCallback(({ usuario, token }) => {
        guardarToken(token);
        setSesion({ status: "autenticado", usuario });
        return usuario;
    }, []);

    const ingresar = useCallback(async (credenciales) => abrir(await iniciarSesion(credenciales)), [abrir]);
    const crearCuenta = useCallback(async (datos) => abrir(await registrarse(datos)), [abrir]);

    const salir = useCallback(async () => {
        cerrandoRef.current = true;
        try {
            await cerrarSesion();
        } catch {
            // Aunque la API no responda, la sesión se cierra en este navegador.
        } finally {
            cerrandoRef.current = false;
            guardarToken(null);
            setSesion(INVITADO);
        }
    }, []);

    const actualizarUsuario = useCallback((usuario) => {
        setSesion((actual) => ({ ...actual, usuario }));
    }, []);

    const valor = useMemo(
        () => ({ ...sesion, ingresar, crearCuenta, salir, actualizarUsuario }),
        [sesion, ingresar, crearCuenta, salir, actualizarUsuario]
    );

    return <SesionContext value={valor}>{children}</SesionContext>;
}
