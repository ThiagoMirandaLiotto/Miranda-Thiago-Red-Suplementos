import { useNavigate, useParams } from "react-router";
import { SearchX } from "lucide-react";
import EncabezadoPanel from "../components/layout/EncabezadoPanel.jsx";
import ProductoForm from "../components/productos/ProductoForm.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import ProductoFormSkeleton from "../components/productos/ProductoFormSkeleton.jsx";
import { useProducto } from "../hooks/useProducto.js";
import { useCategorias } from "../hooks/useCategorias.js";
import { updateProducto } from "../services/productosService.js";
import { toFormValues } from "../utils/productoPayload.js";
import { notify } from "../utils/notify.js";

export default function ProductoEditarPage() {
    const { id } = useParams();
    // Con otro id se monta un formulario nuevo, sin datos del producto anterior.
    return <EditarProducto key={id} id={id} />;
}

function EditarProducto({ id }) {
    const producto = useProducto(id);
    const categorias = useCategorias();
    const navigate = useNavigate();

    function alGuardar(guardado) {
        notify.success(`Guardaste los cambios de «${guardado.nombre}»`);
        navigate("/admin/productos");
    }

    const cargando = producto.status === "loading" || categorias.status === "loading";

    let contenido;
    if (producto.status === "not-found") {
        contenido = (
            <EmptyState
                icon={<SearchX size={28} />}
                titulo="No encontramos este producto"
                accion={<Button to="/admin/productos" variant="secondary">Volver a productos</Button>}
            >
                <p>Puede que se haya dado de baja o que el enlace esté mal escrito.</p>
            </EmptyState>
        );
    } else if (cargando) {
        contenido = <ProductoFormSkeleton />;
    } else if (producto.status === "error") {
        contenido = <ErrorState as="h2" titulo="No pudimos cargar el producto" error={producto.error} onRetry={producto.recargar} />;
    } else if (categorias.status === "error") {
        contenido = <ErrorState as="h2" titulo="No pudimos cargar las categorías" error={categorias.error} onRetry={categorias.recargar} />;
    } else {
        contenido = (
            <ProductoForm
                valoresIniciales={toFormValues(producto.producto)}
                categorias={categorias.categorias}
                guardar={(payload) => updateProducto(id, payload)}
                onGuardado={alGuardar}
                textoGuardar="Guardar cambios"
                textoGuardando="Guardando…"
            />
        );
    }

    const titulo = producto.producto ? `Editar «${producto.producto.nombre}»` : "Editar producto";

    return (
        <>
            <title>{`${titulo} · Panel · RED Suplementos`}</title>
            <EncabezadoPanel titulo={titulo} volver />
            <div aria-busy={cargando}>{contenido}</div>
        </>
    );
}
