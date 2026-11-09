import logoNegativo from "../../assets/brand/logo-negativo.svg";
import logoCompactoNegativo from "../../assets/brand/logo-compacto-negativo.svg";

// Variantes del logo que usa el sitio, vectorizadas desde el original (docs/marca/logo-original.jpg).
// Las demás (positiva y sticker) quedan en assets/brand.
// Ancho y alto salen del viewBox de cada SVG para reservar el espacio antes de que cargue.
const VARIANTES = {
    negativo: { src: logoNegativo, width: 1199, height: 743 },
    "compacto-negativo": { src: logoCompactoNegativo, width: 1162, height: 513 }
};

export default function Logo({ variante = "compacto-negativo", alt = "RED Suplementos", className = "", ...props }) {
    const { src, width, height } = VARIANTES[variante];
    return <img src={src} width={width} height={height} alt={alt} className={className} decoding="async" {...props} />;
}
