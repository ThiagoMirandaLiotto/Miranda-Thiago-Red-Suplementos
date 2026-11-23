import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import SesionProvider from "./context/SesionProvider.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import RutaProtegida from "./components/layout/RutaProtegida.jsx";
import RouteFocus from "./components/layout/RouteFocus.jsx";
import ErrorBoundary from "./components/layout/ErrorBoundary.jsx";
import InicioPage from "./pages/InicioPage.jsx";
import CatalogoPage from "./pages/CatalogoPage.jsx";
import ProductoPage from "./pages/ProductoPage.jsx";
import IngresarPage from "./pages/IngresarPage.jsx";
import RegistroPage from "./pages/RegistroPage.jsx";
import MiCuentaPage from "./pages/MiCuentaPage.jsx";
import AdminPedidosPage from "./pages/AdminPedidosPage.jsx";
import AdminPedidoPage from "./pages/AdminPedidoPage.jsx";
import AdminNuevoPedidoPage from "./pages/AdminNuevoPedidoPage.jsx";
import AdminProductosPage from "./pages/AdminProductosPage.jsx";
import ProductoNuevoPage from "./pages/ProductoNuevoPage.jsx";
import ProductoEditarPage from "./pages/ProductoEditarPage.jsx";
import AdminStockPage from "./pages/AdminStockPage.jsx";
import AdminClientesPage from "./pages/AdminClientesPage.jsx";
import AdminReportesPage from "./pages/AdminReportesPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { ROL } from "./utils/constants.js";

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
            <SesionProvider>
                <RouteFocus />
                <ErrorBoundary>
                    <Routes>
                        <Route element={<PublicLayout />}>
                            <Route index element={<InicioPage />} />
                            <Route path="catalogo" element={<CatalogoPage />} />
                            <Route path="catalogo/:id" element={<ProductoPage />} />
                            <Route path="ingresar" element={<IngresarPage />} />
                            <Route path="registro" element={<RegistroPage />} />
                            <Route path="mi-cuenta" element={<RutaProtegida rol={ROL.CLIENTE}><MiCuentaPage /></RutaProtegida>} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                        {/* RN-10: todo el panel pide la sesión del administrador (y la API lo vuelve a controlar). */}
                        <Route path="admin" element={<RutaProtegida rol={ROL.ADMINISTRADOR}><AdminLayout /></RutaProtegida>}>
                            <Route index element={<Navigate to="pedidos" replace />} />
                            <Route path="pedidos" element={<AdminPedidosPage />} />
                            <Route path="pedidos/nuevo" element={<AdminNuevoPedidoPage />} />
                            <Route path="pedidos/:id" element={<AdminPedidoPage />} />
                            <Route path="productos" element={<AdminProductosPage />} />
                            <Route path="productos/nuevo" element={<ProductoNuevoPage />} />
                            <Route path="productos/:id/editar" element={<ProductoEditarPage />} />
                            <Route path="productos/:id/stock" element={<AdminStockPage />} />
                            <Route path="clientes" element={<AdminClientesPage />} />
                            <Route path="reportes" element={<AdminReportesPage />} />
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
            </SesionProvider>
        </BrowserRouter>
    );
}
