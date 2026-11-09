import Button from "../ui/Button.jsx";
import InstagramIcon from "../ui/InstagramIcon.jsx";
import GaleriaGimnasio from "./GaleriaGimnasio.jsx";
import Revelar from "../ui/Revelar.jsx";
import { useContador } from "../../hooks/useContador.js";
import { useReveal } from "../../hooks/useReveal.js";
import { INSTAGRAM, NEGOCIO } from "../../utils/constants.js";
import { urlMensajeDirecto } from "../../utils/instagram.js";
import fachadaGrande from "../../assets/img/fachada-1440.webp";
import fachadaChica from "../../assets/img/fachada-820.webp";
import fachadaVertical from "../../assets/img/fachada-vertical-760.webp";
import interiorGrande from "../../assets/img/interior-1440.webp";
import interiorChica from "../../assets/img/interior-820.webp";
import interiorVertical from "../../assets/img/interior-vertical-760.webp";
import sociasGrande from "../../assets/img/socias-960.webp";
import sociasChica from "../../assets/img/socias-640.webp";
import styles from "./SobreNosotros.module.css";

// "Sobre nosotros" del boceto. El momento principal del sitio: al bajar, la fachada real se abre
// en una ventana con la inclinación del logo hasta llenar la pantalla, y se entra al gimnasio.
// El título queda afuera, sobre el negro: la ventana es solo imagen.
// Después, foto a la izquierda y texto a la derecha, como en el boceto.
export default function SobreNosotros() {
    const contenidoRef = useReveal();
    const cifraRef = useContador(NEGOCIO.descuentoSocios);

    return (
        <section id="nosotros" className={`${styles.seccion} on-field`} aria-labelledby="nosotros-titulo">
            <Revelar className={styles.apertura}>
                <h2 id="nosotros-titulo" className="display">
                    <span className="linea"><span>Adentro de</span></span>
                    <span className="linea"><span style={{ "--i": 1 }}>RED&nbsp;GYM</span></span>
                </h2>
            </Revelar>

            <div className={styles.escenario}>
                <div className={styles.fijo}>
                    <div className={styles.ventana}>
                        <picture className={styles.fachada}>
                            <source media="(max-width: 719px)" srcSet={fachadaVertical} />
                            <img
                                src={fachadaGrande}
                                srcSet={`${fachadaChica} 820w, ${fachadaGrande} 1440w`}
                                sizes="100vw"
                                width="1440"
                                height="1000"
                                alt={`Fachada de ${NEGOCIO.gimnasio} en ${NEGOCIO.direccion}, con el cartel naranja sobre las vidrieras.`}
                                loading="lazy"
                                decoding="async"
                            />
                        </picture>
                        <picture className={styles.interior}>
                            <source media="(max-width: 719px)" srcSet={interiorVertical} />
                            <img
                                src={interiorGrande}
                                srcSet={`${interiorChica} 820w, ${interiorGrande} 1440w`}
                                sizes="100vw"
                                width="1440"
                                height="960"
                                alt={`Socias entrenando adentro de ${NEGOCIO.gimnasio}, frente a las paredes naranjas.`}
                                loading="lazy"
                                decoding="async"
                            />
                        </picture>
                    </div>
                </div>
            </div>

            <div ref={contenidoRef} className={styles.contenido}>
                <div className={`${styles.retrato} reveal-corte`}>
                    <div className={styles.retratoForma}>
                        <img
                            src={sociasGrande}
                            srcSet={`${sociasChica} 640w, ${sociasGrande} 960w`}
                            sizes="(min-width: 1024px) 42vw, 100vw"
                            width="960"
                            height="1200"
                            alt={`Tres socias de ${NEGOCIO.gimnasio} posan juntas después de entrenar.`}
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                </div>

                <div className={styles.bloques}>
                    <div className={`${styles.bloque} reveal`} style={{ "--i": 1 }}>
                        <h3 className={styles.subtitulo}>En el mismo local</h3>
                        <p>
                            La tienda está en {NEGOCIO.gimnasio}, en {NEGOCIO.direccion}, {NEGOCIO.localidad}.
                            Abrimos todos los días, de {NEGOCIO.horario.apertura} a {NEGOCIO.horario.cierre}&nbsp;h.
                        </p>
                    </div>
                    <div className={`${styles.bloque} reveal`} style={{ "--i": 2 }}>
                        <h3 className={styles.subtitulo}>Pedís por Instagram, retirás acá</h3>
                        <p>
                            Elegís en el catálogo, nos escribís a @{INSTAGRAM.tienda.usuario} y lo retirás
                            en el mostrador cuando venís a entrenar.
                        </p>
                    </div>
                    <div className={`${styles.promo} reveal`} style={{ "--i": 3 }}>
                        <p className={`${styles.cifra} display tabular`} aria-hidden="true">
                            <span ref={cifraRef}>{NEGOCIO.descuentoSocios}</span>&nbsp;%
                        </p>
                        <p className={styles.promoTexto}>
                            <span className="visually-hidden">{NEGOCIO.descuentoSocios} % </span>
                            de descuento para socios de {NEGOCIO.gimnasio} con membresía activa.
                        </p>
                    </div>
                    <div className="reveal" style={{ "--i": 4 }}>
                        <Button href={urlMensajeDirecto()} size="lg" icon={<InstagramIcon size={20} />}>
                            Escribinos por Instagram
                        </Button>
                    </div>
                </div>
            </div>

            <GaleriaGimnasio />
        </section>
    );
}
