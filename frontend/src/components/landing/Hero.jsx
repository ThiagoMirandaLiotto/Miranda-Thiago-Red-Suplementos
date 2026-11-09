import { useRef } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button.jsx";
import BotonMovimiento from "../ui/BotonMovimiento.jsx";
import InstagramIcon from "../ui/InstagramIcon.jsx";
import { useEstadoLocal } from "../../hooks/useEstadoLocal.js";
import { useMagnetico } from "../../hooks/usePuntero.js";
import { useRotacion } from "../../hooks/useRotacion.js";
import { urlMensajeDirecto } from "../../utils/instagram.js";
import remoGrande from "../../assets/img/socio-remo-1200.webp";
import remoChica from "../../assets/img/socio-remo-720.webp";
import mancuernasGrande from "../../assets/img/hero-mancuernas-853.webp";
import mancuernasChica from "../../assets/img/hero-mancuernas-640.webp";
import discoGrande from "../../assets/img/hero-disco-1200.webp";
import discoChica from "../../assets/img/hero-disco-720.webp";
import styles from "./Hero.module.css";

const FOTOS = [
    {
        srcSet: `${remoChica} 720w, ${remoGrande} 1200w`,
        src: remoGrande,
        ancho: 1200,
        alto: 1500,
        posicion: "50% 28%",
        alt: "Un socio de RED GYM entrena en la máquina de remo, frente a la pared naranja del gimnasio."
    },
    {
        srcSet: `${mancuernasChica} 640w, ${mancuernasGrande} 853w`,
        src: mancuernasGrande,
        ancho: 853,
        alto: 1067,
        posicion: "50% 22%",
        alt: ""
    },
    {
        srcSet: `${discoChica} 720w, ${discoGrande} 1200w`,
        src: discoGrande,
        ancho: 1200,
        alto: 1498,
        posicion: "50% 35%",
        alt: ""
    }
];

// Hero del boceto: texto a la izquierda y foto a la derecha, ahora a toda la pantalla.
// La foto va dentro de un corte con la inclinación del "RED" del logo y rota entre tres tomas reales.
export default function Hero() {
    const seccionRef = useRef(null);
    const estado = useEstadoLocal();
    const { activa, previa } = useRotacion(seccionRef, FOTOS.length);
    const magneticoRef = useMagnetico();

    return (
        <section ref={seccionRef} className={`${styles.hero} on-field`} aria-labelledby="inicio-titulo">
            <div className={styles.corte}>
                <div className={styles.fotos}>
                    {FOTOS.map((foto, indice) => (
                        <img
                            key={foto.src}
                            className={styles.foto}
                            data-estado={indice === activa ? "activa" : indice === previa ? "previa" : "espera"}
                            src={foto.src}
                            srcSet={foto.srcSet}
                            sizes="(min-width: 1024px) 62vw, 100vw"
                            width={foto.ancho}
                            height={foto.alto}
                            alt={foto.alt}
                            style={{ objectPosition: foto.posicion }}
                            fetchPriority={indice === 0 ? "high" : "low"}
                        />
                    ))}
                </div>
                <div className={styles.velo} />
            </div>

            <div className={styles.texto}>
                <h1 id="inicio-titulo" className={`${styles.titulo} display linea-carga`}>
                    <span className="linea"><span>Todo en</span></span>
                    <span className="linea"><span style={{ "--i": 1 }}>suplementos</span></span>
                </h1>
                <div className={styles.columna}>
                    <p className={styles.lead}>La tienda adentro de RED&nbsp;GYM, en Saavedra. Comprás donde entrenás.</p>
                    <p className={styles.estado} data-abierto={estado.abierto}>{estado.texto}</p>
                    <div className={styles.acciones}>
                        <span ref={magneticoRef} className={styles.magnetico}>
                            <Button href={urlMensajeDirecto()} size="lg" icon={<InstagramIcon size={20} />}>
                                Escribinos por Instagram
                            </Button>
                        </span>
                        <Link to="/catalogo" className={styles.enlace}>
                            Ver productos
                            <ArrowRight size={20} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </div>

            <BotonMovimiento className={styles.pausa} />
        </section>
    );
}
