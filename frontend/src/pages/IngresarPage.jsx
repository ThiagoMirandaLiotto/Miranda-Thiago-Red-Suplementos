import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { CircleAlert, LogIn } from "lucide-react";
import EncabezadoPublico from "../components/layout/EncabezadoPublico.jsx";
import Button from "../components/ui/Button.jsx";
import CheckboxField from "../components/ui/CheckboxField.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useReveal } from "../hooks/useReveal.js";
import { useSesion } from "../hooks/useSesion.js";
import { INSTAGRAM, NEGOCIO, ROL, inicioSegunRol } from "../utils/constants.js";
import { mensajeDeError, notify } from "../utils/notify.js";
import { validarIngreso } from "../utils/validarCuenta.js";
import fotoGrande from "../assets/img/suplementos-mostrador-660.webp";
import fotoChica from "../assets/img/suplementos-mostrador-440.webp";
import styles from "./CuentaPage.module.css";

// Solo en desarrollo (npm run dev): las cuentas que carga la API con DATOS_DEMO.
const CUENTAS_DEMO = import.meta.env.DEV ? [
    { perfil: "Dueño del local", email: "admin@redsuplementos.com", contrasena: "RedAdmin2026" },
    { perfil: "Cliente", email: "cliente@example.com", contrasena: "Cliente2026" },
    { perfil: "Socia verificada", email: "socia@example.com", contrasena: "Cliente2026" }
] : [];

export default function IngresarPage() {
    const { status, usuario, ingresar } = useSesion();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [valores, setValores] = useState({ email: "", contrasena: "" });
    const [errores, setErrores] = useState({});
    const [errorEnvio, setErrorEnvio] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [verContrasena, setVerContrasena] = useState(false);
    const revelar = useReveal();

    // Con la sesión ya abierta, el formulario no hace falta.
    if (status === "autenticado" && !enviando) return <Navigate to={inicioSegunRol(usuario.rol)} replace />;

    function cambiar(event) {
        const { name, value } = event.target;
        setValores((actuales) => ({ ...actuales, [name]: value }));
        setErrores((anteriores) => ({ ...anteriores, [name]: undefined }));
        setErrorEnvio(null);
    }

    async function enviar(event) {
        event.preventDefault();
        if (enviando) return;
        const formulario = event.currentTarget;
        const { errores: encontrados, valido } = validarIngreso(valores);
        setErrores(encontrados);
        setErrorEnvio(null);
        if (!valido) {
            formulario.elements.namedItem(encontrados.email ? "email" : "contrasena")?.focus();
            return;
        }
        setEnviando(true);
        try {
            const cuenta = await ingresar({ email: valores.email.trim(), contrasena: valores.contrasena });
            notify.success(`Hola, ${cuenta.nombre}`, {
                description: cuenta.rol === ROL.ADMINISTRADOR ? "Entraste al panel del local." : "Ya podés seguir tus pedidos."
            });
            navigate(state?.desde ?? inicioSegunRol(cuenta.rol), { replace: true });
        } catch (error) {
            setErrorEnvio(mensajeDeError(error));
            notify.error(error, { id: "ingresar" });
            setEnviando(false);
            formulario.elements.namedItem("contrasena")?.select();
        }
    }

    return (
        <>
            <title>Ingresar · RED Suplementos</title>
            <EncabezadoPublico lineas={["Ingresar"]} bajada="Seguí tus pedidos y tu descuento de socio de RED GYM." />

            <div ref={revelar} className={styles.cuerpo}>
                <form className={`${styles.panel} reveal`} onSubmit={enviar} noValidate aria-label="Ingresar a tu cuenta">
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={valores.email}
                        onChange={cambiar}
                        error={errores.email}
                        required
                    />
                    <TextField
                        label="Contraseña"
                        name="contrasena"
                        type={verContrasena ? "text" : "password"}
                        autoComplete="current-password"
                        value={valores.contrasena}
                        onChange={cambiar}
                        error={errores.contrasena}
                        required
                    />
                    <CheckboxField label="Mostrar la contraseña" checked={verContrasena} onChange={(event) => setVerContrasena(event.target.checked)} />
                    {errorEnvio ? (
                        <p className={styles.error} role="alert"><CircleAlert size={18} aria-hidden="true" />{errorEnvio}</p>
                    ) : null}
                    <Button type="submit" size="lg" fullWidth icon={<LogIn size={18} aria-hidden="true" />} loading={enviando} loadingText="Ingresando…">
                        Ingresar
                    </Button>
                    <p className={styles.alternativa}>
                        ¿Todavía no tenés cuenta? <Link to="/registro" state={state}>Creala en un minuto</Link>
                    </p>
                    {CUENTAS_DEMO.length ? (
                        <details className={styles.demo}>
                            <summary>Cuentas de demostración</summary>
                            <ul>
                                {CUENTAS_DEMO.map((demo) => (
                                    <li key={demo.email}>
                                        <span><strong>{demo.perfil}:</strong> {demo.email} · {demo.contrasena}</span>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setValores({ email: demo.email, contrasena: demo.contrasena });
                                                setErrores({});
                                                setErrorEnvio(null);
                                            }}
                                        >
                                            Completar
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    ) : null}
                </form>

                <aside className={styles.lado} aria-label="Para qué sirve la cuenta">
                    <figure className={`${styles.foto} reveal`} style={{ "--i": 1 }}>
                        <img
                            src={fotoGrande}
                            srcSet={`${fotoChica} 440w, ${fotoGrande} 660w`}
                            sizes="(min-width: 960px) 22vw, 100vw"
                            width="660"
                            height="825"
                            alt="Suplementos de la tienda apilados sobre discos de pesas: proteínas, creatinas, aminoácidos y barras."
                        />
                    </figure>
                    <ul className={styles.razones}>
                        <li className="reveal" style={{ "--i": 2 }}>
                            <strong>Pedís por Instagram, como siempre.</strong>
                            Escribinos a @{INSTAGRAM.tienda.usuario} y el local registra tu pedido a tu nombre.
                        </li>
                        <li className="reveal" style={{ "--i": 3 }}>
                            <strong>Seguís cada pedido.</strong>
                            Ves cuándo está listo para retirar, tu historial y podés cancelarlo mientras está pendiente.
                        </li>
                        <li className="reveal" style={{ "--i": 4 }}>
                            <strong>Socios de {NEGOCIO.gimnasio}: {NEGOCIO.descuentoSocios} %.</strong>
                            Lo verificamos en el mostrador y se aplica solo en tus pedidos.
                        </li>
                    </ul>
                </aside>
            </div>
        </>
    );
}
