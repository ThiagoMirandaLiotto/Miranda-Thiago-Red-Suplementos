import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import RouteFocus from "./components/layout/RouteFocus.jsx";
import ErrorBoundary from "./components/layout/ErrorBoundary.jsx";
import InicioPage from "./pages/InicioPage.jsx";
import CatalogoPage from "./pages/CatalogoPage.jsx";
import ProductoPage from "./pages/ProductoPage.jsx";
import AdminProductosPage from "./pages/AdminProductosPage.jsx";
import ProductoNuevoPage from "./pages/ProductoNuevoPage.jsx";
import ProductoEditarPage from "./pages/ProductoEditarPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Avisos laterales con la paleta de la marca (ver también styles/global.css).
const estiloAvisos = {
    "--normal-bg": "var(--color-field)",
    "--normal-text": "var(--color-ink-on-field)",
    "--normal-border": "var(--color-field-border)",
    "--border-radius": "0px"
};

export default function App() {
    return (
        // Sin transiciones: los filtros viven en la URL y sus campos no pueden esperar
        // a una actualización asíncrona (se perderían letras al tipear).
        <BrowserRouter useTransitions={false}>
            <RouteFocus />
            <ErrorBoundary>
                <Routes>
                    <Route element={<PublicLayout />}>
                        <Route index element={<InicioPage />} />
                        <Route path="catalogo" element={<CatalogoPage />} />
                        <Route path="catalogo/:id" element={<ProductoPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                    <Route path="admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="productos" replace />} />
                        <Route path="productos" element={<AdminProductosPage />} />
                        <Route path="productos/nuevo" element={<ProductoNuevoPage />} />
                        <Route path="productos/:id/editar" element={<ProductoEditarPage />} />
                    </Route>
                </Routes>
            </ErrorBoundary>
            <Toaster
                position="bottom-right"
                theme="dark"
                visibleToasts={3}
                offset={24}
                style={estiloAvisos}
                containerAriaLabel="Avisos"
            />
        </BrowserRouter>
    );
}
