import { useNavigate } from "react-router";
import EncabezadoPanel from "../components/layout/EncabezadoPanel.jsx";
import ProductoForm from "../components/productos/ProductoForm.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import ProductoFormSkeleton from "../components/productos/ProductoFormSkeleton.jsx";
import { useCategorias } from "../hooks/useCategorias.js";
import { createProducto } from "../services/productosService.js";
import { notify } from "../utils/notify.js";

export default function ProductoNuevoPage() {
    const categorias = useCategorias();
    const navigate = useNavigate();

    function alGuardar(producto) {
        notify.success(`Creaste «${producto.nombre}»`, { description: "Ya aparece en la tienda y en el catálogo." });
        navigate("/admin/productos");
    }

    let contenido;
    if (categorias.status === "loading") {
        contenido = <ProductoFormSkeleton />;
    } else if (categorias.status === "error") {
        contenido = <ErrorState as="h2" titulo="No pudimos cargar las categorías" error={categorias.error} onRetry={categorias.recargar} />;
    } else {
        contenido = (
            <ProductoForm
                categorias={categorias.categorias}
                guardar={createProducto}
                onGuardado={alGuardar}
                textoGuardar="Crear producto"
                textoGuardando="Creando…"
            />
        );
    }

    return (
        <>
            <title>Nuevo producto · Panel · RED Suplementos</title>
            <EncabezadoPanel titulo="Nuevo producto" volver />
            <div aria-busy={categorias.status === "loading"}>{contenido}</div>
        </>
    );
}

