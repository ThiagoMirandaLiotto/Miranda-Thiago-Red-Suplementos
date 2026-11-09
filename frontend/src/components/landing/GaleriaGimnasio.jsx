import { NEGOCIO } from "../../utils/constants.js";
import mancuernas from "../../assets/img/galeria-1-520.webp";
import banda from "../../assets/img/galeria-4-520.webp";
import maquinas from "../../assets/img/galeria-5-520.webp";
import guantes from "../../assets/img/galeria-6-520.webp";
import sentadilla from "../../assets/img/galeria-7-520.webp";
import sala from "../../assets/img/galeria-8-520.webp";
import plancha from "../../assets/img/galeria-9-520.webp";
import stock from "../../assets/img/suplementos-mostrador-440.webp";
import styles from "./GaleriaGimnasio.module.css";

const GYM = NEGOCIO.gimnasio;

const FILA_A = [
    { src: mancuernas, alt: `Una socia entrena con mancuernas en ${GYM}.` },
    { src: guantes, alt: `Un profesor le sostiene las manoplas a un alumno en ${GYM}.` },
    { src: plancha, alt: `Un socio hace un ejercicio de piso frente a la pared naranja de ${GYM}.` },
    { src: banda, alt: `Una socia trabaja con una banda elástica, frente a la pared amarilla de ${GYM}.` }
];

const FILA_B = [
    { src: sentadilla, alt: `Una socia hace sentadillas con discos, en una foto en blanco y negro de ${GYM}.` },
    { src: stock, alt: "Suplementos de la tienda apilados sobre discos de pesas." },
    { src: sala, alt: `Una socia en una máquina de la sala, con piso de madera y paredes amarillas.` },
    { src: maquinas, alt: `Dos socias entrenan en máquinas, junto a los ventanales de ${GYM}.` }
];

// Dos filas de fotos reales que se cruzan al bajar. Cada fila va duplicada para cubrir el ancho;
// la copia es decorativa y no se anuncia.
function Fila({ fotos, sentido }) {
    return (
        <ul className={styles.fila} data-sentido={sentido}>
            {[...fotos, ...fotos].map((foto, indice) => (
                <li key={`${foto.src}-${indice}`} className={styles.foto} aria-hidden={indice >= fotos.length || undefined}>
                    <img
                        src={foto.src}
                        width="520"
                        height="650"
                        alt={indice >= fotos.length ? "" : foto.alt}
                        loading="lazy"
                        decoding="async"
                    />
                </li>
            ))}
        </ul>
    );
}

export default function GaleriaGimnasio() {
    return (
        <div className={styles.galeria}>
            <Fila fotos={FILA_A} sentido="izquierda" />
            <Fila fotos={FILA_B} sentido="derecha" />
        </div>
    );
}
