import styles from "./PlacaProducto.module.css";

// Ilustración del envase para productos sin foto: nunca una foto falsa de producto.
// Pote para proteínas y pre-entrenos, frasco para creatina y aminoácidos, barra para barras.
const FORMAS = { 1: "pote", 2: "frasco", 3: "pote", 4: "frasco", 5: "barra" };

function tamanoTexto(texto, ancho, maximo) {
    return Math.min(maximo, Math.floor(ancho / Math.max(texto.length * 0.62, 1)));
}

export default function PlacaProducto({ idCategoria, categoria, marca }) {
    const forma = FORMAS[idCategoria] ?? "pote";
    const textoMarca = marca || "RED";

    return (
        <svg className={styles.placa} viewBox="0 0 400 400" aria-hidden="true" focusable="false" data-zoom>
            <rect width="400" height="400" className={styles.fondo} />
            {forma === "barra" ? (
                <g className={styles.envase}><g transform="rotate(-10 200 200)">
                    <polygon className={styles.papel} points="70,158 56,168 70,178 56,188 70,198 56,208 70,218 56,228 70,242" />
                    <polygon className={styles.papel} points="330,158 344,168 330,178 344,188 330,198 344,208 330,218 344,228 330,242" />
                    <rect className={styles.papel} x="68" y="158" width="264" height="84" />
                    <rect className={styles.banda} x="68" y="158" width="20" height="84" />
                    <rect className={styles.banda} x="312" y="158" width="20" height="84" />
                    <text className={styles.marca} x="200" y="204" fontSize={tamanoTexto(textoMarca, 200, 40)}>{textoMarca}</text>
                    <text className={styles.categoria} x="200" y="228">{categoria}</text>
                </g></g>
            ) : null}
            {forma === "pote" ? (
                <g className={styles.envase}>
                    <rect className={styles.tapa} x="108" y="84" width="184" height="36" />
                    <path className={styles.cuerpo} d="M116 124 H284 L276 318 Q275 330 263 330 H137 Q125 330 124 318 Z" />
                    <rect className={styles.papel} x="122" y="170" width="156" height="100" />
                    <text className={styles.marca} x="200" y="220" fontSize={tamanoTexto(textoMarca, 136, 36)}>{textoMarca}</text>
                    <text className={styles.categoria} x="200" y="250">{categoria}</text>
                </g>
            ) : null}
            {forma === "frasco" ? (
                <g className={styles.envase}>
                    <rect className={styles.tapa} x="140" y="70" width="120" height="32" />
                    <path className={styles.cuerpo} d="M144 106 H256 V322 Q256 334 244 334 H156 Q144 334 144 322 Z" />
                    <rect className={styles.papel} x="148" y="166" width="104" height="112" />
                    <text className={styles.marca} x="200" y="218" fontSize={tamanoTexto(textoMarca, 92, 30)}>{textoMarca}</text>
                    <text className={styles.categoria} x="200" y="248">{categoria}</text>
                </g>
            ) : null}
        </svg>
    );
}
