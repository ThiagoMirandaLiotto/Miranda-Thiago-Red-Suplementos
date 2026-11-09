import { Link } from "react-router";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import InstagramIcon from "../ui/InstagramIcon.jsx";
import TextoRoll from "../ui/TextoRoll.jsx";
import { INSTAGRAM, NEGOCIO } from "../../utils/constants.js";
import { urlPerfil } from "../../utils/instagram.js";
import fotoGrande from "../../assets/img/cierre-1024.webp";
import fotoChica from "../../assets/img/cierre-720.webp";
import styles from "./Footer.module.css";

const anio = new Date().getFullYear();

const ENLACES = [
    { etiqueta: "Inicio", destino: "/" },
    { etiqueta: "Nosotros", destino: "/#nosotros" },
    { etiqueta: "Productos", destino: "/catalogo" },
    { etiqueta: "Administrar productos", destino: "/admin/productos" }
];

export default function Footer() {
    return (
        <footer id="contacto" className={`${styles.footer} on-field`} aria-labelledby="contacto-titulo">
            <img
                className={styles.foto}
                src={fotoGrande}
                srcSet={`${fotoChica} 720w, ${fotoGrande} 1024w`}
                sizes="100vw"
                width="1024"
                height="683"
                alt=""
                loading="lazy"
                decoding="async"
            />
            <div className={styles.capa}>
                <div className={styles.superior}>
                    <nav aria-label="Secciones">
                        <ul className={styles.enlaces}>
                            {ENLACES.map(({ etiqueta, destino }) => (
                                <li key={destino}>
                                    <Link to={destino}><TextoRoll>{etiqueta}</TextoRoll></Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className={styles.contacto}>
                        <h2 id="contacto-titulo" className={styles.titulo}>Contacto</h2>
                        <address className={styles.datos}>
                            <p><MapPin size={18} aria-hidden="true" />{NEGOCIO.direccion}, {NEGOCIO.localidad}</p>
                            <p><Clock size={18} aria-hidden="true" />{NEGOCIO.horario.texto}</p>
                            <p>
                                <InstagramIcon />
                                <a href={urlPerfil(INSTAGRAM.tienda.usuario)} target="_blank" rel="noopener noreferrer">
                                    @{INSTAGRAM.tienda.usuario}
                                    <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
                                </a>
                                <span className={styles.nota}>tienda</span>
                            </p>
                            <p>
                                <InstagramIcon />
                                <a href={urlPerfil(INSTAGRAM.gimnasio.usuario)} target="_blank" rel="noopener noreferrer">
                                    @{INSTAGRAM.gimnasio.usuario}
                                    <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
                                </a>
                                <span className={styles.nota}>gimnasio</span>
                            </p>
                        </address>
                        <a className={styles.mapa} href={NEGOCIO.mapaUrl} target="_blank" rel="noopener noreferrer">
                            Cómo llegar
                            <ArrowUpRight size={18} aria-hidden="true" />
                            <span className="visually-hidden"> (se abre Google Maps en una pestaña nueva)</span>
                        </a>
                    </div>
                </div>

                <div className={styles.inferior}>
                    <Logo variante="negativo" alt="RED Suplementos. Todo en suplementos" className={styles.logo} loading="lazy" />
                    <p className={styles.legal}>© {anio} {NEGOCIO.nombre}. Fotos: {NEGOCIO.gimnasio}.</p>
                </div>
            </div>
        </footer>
    );
}
