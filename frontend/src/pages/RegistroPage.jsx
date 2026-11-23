import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { CircleAlert, UserPlus } from "lucide-react";
import EncabezadoPublico from "../components/layout/EncabezadoPublico.jsx";
import Button from "../components/ui/Button.jsx";
import CheckboxField from "../components/ui/CheckboxField.jsx";
import TextField from "../components/ui/TextField.jsx";
import { useReveal } from "../hooks/useReveal.js";
import { useSesion } from "../hooks/useSesion.js";
import { NEGOCIO, inicioSegunRol } from "../utils/constants.js";
import { mensajeDeError, notify } from "../utils/notify.js";
import { limpiarTelefono, validarRegistro } from "../utils/validarCuenta.js";
import fotoGrande from "../assets/img/socias-960.webp";
import fotoChica from "../assets/img/socias-640.webp";
import styles from "./CuentaPage.module.css";

const ORDEN = ["nombre", "apellido", "email", "telefono", "contrasena", "confirmacion"];
const VACIO = { nombre: "", apellido: "", email: "", telefono: "", contrasena: "", confirmacion: "", esSocioGym: false };

// F-01: alta de cuenta de cliente. Las validaciones son las mismas que aplica la API (V-01, V-02, V-03, V-07).
export default function RegistroPage() {
    const { status, usuario, crearCuenta } = useSesion();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [valores, setValores] = useState(VACIO);
    const [errores, setErrores] = useState({});
    const [errorEnvio, setErrorEnvio] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const revelar = useReveal();

    if (status === "autenticado" && !enviando) return <Navigate to={inicioSegunRol(usuario.rol)} replace />;

    function cambiar(event) {
        const { name, value, type, checked } = event.target;
        const nuevos = { ...valores, [name]: type === "checkbox" ? checked : value };
        setValores(nuevos);
        setErrorEnvio(null);
        // Si el campo ya mostraba un error, se revalida mientras se corrige.
        if (errores[name]) setErrores((anteriores) => ({ ...anteriores, [name]: validarRegistro(nuevos).errores[name] }));
    }

    function alSalir(event) {
        const { name } = event.target;
        if (!valores[name] && !errores[name]) return;
        setErrores((anteriores) => ({ ...anteriores, [name]: validarRegistro(valores).errores[name] }));
    }

    async function enviar(event) {
        event.preventDefault();
        if (enviando) return;
        const formulario = event.currentTarget;
        const { errores: encontrados, valido } = validarRegistro(valores);
        setErrores(encontrados);
        setErrorEnvio(null);
        if (!valido) {
            const cantidad = Object.keys(encontrados).length;
            notify.error(cantidad === 1 ? "Revisá el dato marcado." : `Revisá los ${cantidad} datos marcados.`, { id: "validacion-registro" });
            formulario.elements.namedItem(ORDEN.find((campo) => encontrados[campo]))?.focus();
            return;
        }
        setEnviando(true);
        try {
            const cuenta = await crearCuenta({
                nombre: valores.nombre.trim(),
                apellido: valores.apellido.trim(),
                email: valores.email.trim(),
                telefono: limpiarTelefono(valores.telefono.trim()),
                contrasena: valores.contrasena,
                confirmacion: valores.confirmacion,
                esSocioGym: valores.esSocioGym
            });
            notify.success(`Listo, ${cuenta.nombre}: ya tenés tu cuenta`, {
                description: cuenta.esSocioGym
                    ? "Cuando verifiquemos tu membresía en el mostrador, se aplica el 10 %."
                    : "Cuando el local registre un pedido tuyo, lo vas a ver en «Mi cuenta»."
            });
            navigate(state?.desde ?? inicioSegunRol(cuenta.rol), { replace: true });
        } catch (error) {
            setErrorEnvio(mensajeDeError(error));
            notify.error(error, { id: "registro" });
            // Email repetido (RN-07): el error va al campo.
            if (error.status === 409) {
                setErrores((anteriores) => ({ ...anteriores, email: "Ya hay una cuenta con este email. Probá ingresar." }));
                formulario.elements.namedItem("email")?.focus();
            }
            setEnviando(false);
        }
    }

    const campo = (nombre) => ({ name: nombre, value: valores[nombre], onChange: cambiar, onBlur: alSalir, error: errores[nombre], required: true });

    return (
        <>
            <title>Crear cuenta · RED Suplementos</title>
            <EncabezadoPublico lineas={["Crear cuenta"]} bajada="Un minuto y seguís tus pedidos desde el celular." />

            <div ref={revelar} className={styles.cuerpo}>
                <form className={`${styles.panel} reveal`} onSubmit={enviar} noValidate aria-label="Crear tu cuenta">
                    <div className={styles.dupla}>
                        <TextField label="Nombre" autoComplete="given-name" maxLength={80} {...campo("nombre")} />
                        <TextField label="Apellido" autoComplete="family-name" maxLength={80} {...campo("apellido")} />
                    </div>
                    <TextField label="Email" type="email" autoComplete="email" {...campo("email")} />
                    <TextField
                        label="Teléfono"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        hint="Con código de área, por ejemplo 1123456789."
                        {...campo("telefono")}
                    />
                    <TextField
                        label="Contraseña"
                        type="password"
                        autoComplete="new-password"
                        hint="8 o más caracteres, con letras y números."
                        {...campo("contrasena")}
                    />
                    <TextField label="Repetí la contraseña" type="password" autoComplete="new-password" {...campo("confirmacion")} />
                    <CheckboxField
                        name="esSocioGym"
                        label={`Soy socio de ${NEGOCIO.gimnasio}`}
                        hint={`El ${NEGOCIO.descuentoSocios} % se aplica cuando verificamos tu membresía en el mostrador.`}
                        checked={valores.esSocioGym}
                        onChange={cambiar}
                    />
                    {errorEnvio ? (
                        <p className={styles.error} role="alert"><CircleAlert size={18} aria-hidden="true" />{errorEnvio}</p>
                    ) : null}
                    <Button type="submit" size="lg" fullWidth icon={<UserPlus size={18} aria-hidden="true" />} loading={enviando} loadingText="Creando tu cuenta…">
                        Crear cuenta
                    </Button>
                    <p className={styles.alternativa}>
                        ¿Ya tenés cuenta? <Link to="/ingresar" state={state}>Ingresá</Link>
                    </p>
                </form>

                <aside className={styles.lado} aria-label="Qué incluye la cuenta">
                    <figure className={`${styles.foto} reveal`} style={{ "--i": 1 }}>
                        <img
                            src={fotoGrande}
                            srcSet={`${fotoChica} 640w, ${fotoGrande} 960w`}
                            sizes="(min-width: 960px) 22vw, 100vw"
                            width="960"
                            height="1200"
                            alt={`Tres socias de ${NEGOCIO.gimnasio} posan juntas después de entrenar.`}
                        />
                    </figure>
                    <ul className={styles.razones}>
                        <li className="reveal" style={{ "--i": 2 }}>
                            <strong>Tus datos, solo para tus pedidos.</strong>
                            El email identifica tu cuenta y el teléfono es para que el local pueda llamarte si hace falta.
                        </li>
                        <li className="reveal" style={{ "--i": 3 }}>
                            <strong>Retirás en {NEGOCIO.direccion}.</strong>
                            {NEGOCIO.horario.texto}, en la franja que acordes con el local.
                        </li>
                    </ul>
                </aside>
            </div>
        </>
    );
}
