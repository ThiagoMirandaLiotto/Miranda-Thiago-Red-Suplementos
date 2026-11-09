import Button from "../components/ui/Button.jsx";
import fotoGrande from "../assets/img/interior-1440.webp";
import fotoChica from "../assets/img/interior-820.webp";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
    return (
        <section className={`${styles.pagina} on-field`} aria-labelledby="no-encontrada-titulo">
            <title>Página no encontrada · RED Suplementos</title>
            <div className={styles.corte}>
                <img
                    src={fotoGrande}
                    srcSet={`${fotoChica} 820w, ${fotoGrande} 1440w`}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    width="1440"
                    height="960"
                    alt=""
                />
            </div>
            <div className={styles.texto}>
                <h1 id="no-encontrada-titulo" className="display linea-carga">
                    <span className="linea"><span>Página no</span></span>
                    <span className="linea"><span style={{ "--i": 1 }}>encontrada</span></span>
                </h1>
                <p className={styles.bajada}>Puede que el enlace esté mal escrito o que la página ya no exista.</p>
                <div className={styles.acciones}>
                    <Button to="/" variant="secondary">Ir al inicio</Button>
                    <Button to="/catalogo" variant="tonal">Ver el catálogo</Button>
                </div>
            </div>
        </section>
    );
}
