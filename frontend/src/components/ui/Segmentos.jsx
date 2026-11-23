import { useId } from "react";
import styles from "./Segmentos.module.css";

// Grupo de opciones excluyentes con radios nativos: las flechas del teclado cambian la opción
// y el lector de pantalla anuncia el grupo. "detalle" suma un dato corto, como una cantidad.
export default function Segmentos({ leyenda, ocultarLeyenda = false, opciones, valor, onCambiar, ancho = false }) {
    const nombre = useId();
    return (
        <fieldset className={`${styles.grupo} ${ancho ? styles.ancho : ""}`}>
            <legend className={ocultarLeyenda ? "visually-hidden" : styles.leyenda}>{leyenda}</legend>
            <div className={styles.opciones}>
                {opciones.map((opcion) => (
                    <label key={opcion.valor} className={styles.opcion}>
                        <input
                            type="radio"
                            name={nombre}
                            value={opcion.valor}
                            checked={valor === opcion.valor}
                            onChange={() => onCambiar(opcion.valor)}
                            className="visually-hidden"
                        />
                        <span className={styles.etiqueta}>
                            {opcion.etiqueta}
                            {opcion.detalle !== undefined ? <span className={`${styles.detalle} tabular`}>{opcion.detalle}</span> : null}
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
