import Hero from "../components/landing/Hero.jsx";
import Marquesina from "../components/landing/Marquesina.jsx";
import SobreNosotros from "../components/landing/SobreNosotros.jsx";
import ProductosEstrella from "../components/landing/ProductosEstrella.jsx";

// Los cinco bloques del boceto: navegación y footer vienen del layout público.
export default function InicioPage() {
    return (
        <>
            <title>RED Suplementos · Todo en suplementos, adentro de RED GYM</title>
            <Hero />
            <Marquesina />
            <SobreNosotros />
            <ProductosEstrella />
        </>
    );
}
