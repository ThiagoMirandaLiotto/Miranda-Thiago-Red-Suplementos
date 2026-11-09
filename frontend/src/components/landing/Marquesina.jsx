import { useMarquesina } from "../../hooks/useMarquesina.js";
import { NEGOCIO } from "../../utils/constants.js";
import styles from "./Marquesina.module.css";

const FRASES_NEGOCIO = [
    "Todo en suplementos",
    `Adentro de ${NEGOCIO.gimnasio}`,
    NEGOCIO.horario.texto,
    `${NEGOCIO.descuentoSocios} % para socios`,
    "Retirás en el mostrador"
];

// Datos reales en una banda que cruza la pantalla: del negocio, o del producto en su página.
// Es decorativa: todo lo que dice también está en el texto de la página.
export default function Marquesina({ frases = FRASES_NEGOCIO }) {
    const pistaRef = useMarquesina();

    return (
        <div className={styles.banda} aria-hidden="true">
            <div ref={pistaRef} className={`${styles.pista} en-bucle`}>
                {[0, 1].map((copia) => (
                    <ul key={copia} className={styles.grupo}>
                        {frases.map((frase, indice) => (
                            <li key={indice} className={`${styles.frase} display`}>{frase}</li>
                        ))}
                    </ul>
                ))}
            </div>
        </div>
    );
}
