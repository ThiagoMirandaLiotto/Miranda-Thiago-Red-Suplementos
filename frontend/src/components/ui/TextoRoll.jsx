// Texto de enlace que rueda al pasar el mouse: sube y lo reemplaza su copia (ver styles/global.css).
// La copia es contenido generado por CSS y queda fuera del árbol de accesibilidad.
export default function TextoRoll({ children }) {
    return (
        <span className="roll">
            <span data-texto={children}>{children}</span>
        </span>
    );
}
