import { useId } from "react";
import { Search } from "lucide-react";
import TextField from "../ui/TextField.jsx";
import SelectField from "../ui/SelectField.jsx";
import Button from "../ui/Button.jsx";
import { ORDENES, hayFiltrosActivos } from "../../utils/filtrarProductos.js";
import { formatCantidad } from "../../utils/formatters.js";
import styles from "./ProductoFiltros.module.css";

// Filtros del catálogo público y del panel: comparten búsqueda y categoría;
// el público suma marca y orden, el panel suma el filtro de stock bajo.
export default function ProductoFiltros({ filtros, onCambiar, onLimpiar, categorias, marcas = [], resultados, variante = "publico", cargando = false }) {
    const checkId = useId();
    const esPanel = variante === "panel";
    const campoStock = esPanel ? "soloStockBajo" : "soloConStock";

    return (
        <div className={styles.contenedor}>
            <form
                className={styles.filtros}
                data-variante={variante}
                role="search"
                aria-label="Filtrar productos"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className={styles.busqueda}>
                    <TextField
                        label="Buscar"
                        type="search"
                        placeholder="Nombre, marca o sabor"
                        value={filtros.busqueda}
                        onChange={(event) => onCambiar("busqueda", event.target.value)}
                        autoComplete="off"
                    />
                    <Search className={styles.lupa} size={18} aria-hidden="true" />
                </div>
                <SelectField
                    label="Categoría"
                    placeholder="Todas"
                    options={categorias.map((categoria) => ({ valor: String(categoria.idCategoria), etiqueta: categoria.nombre }))}
                    value={filtros.idCategoria}
                    onChange={(event) => onCambiar("idCategoria", event.target.value)}
                />
                {esPanel ? null : (
                    <>
                        <SelectField
                            label="Marca"
                            placeholder="Todas"
                            options={marcas.map((marca) => ({ valor: marca, etiqueta: marca }))}
                            value={filtros.marca}
                            onChange={(event) => onCambiar("marca", event.target.value)}
                        />
                        <SelectField
                            label="Ordenar por"
                            options={ORDENES}
                            value={filtros.orden}
                            onChange={(event) => onCambiar("orden", event.target.value)}
                        />
                    </>
                )}
                <div className={styles.check}>
                    <input
                        id={checkId}
                        type="checkbox"
                        checked={filtros[campoStock]}
                        onChange={(event) => onCambiar(campoStock, event.target.checked)}
                    />
                    <label htmlFor={checkId}>{esPanel ? "Solo stock bajo o sin stock" : "Solo con stock"}</label>
                </div>
            </form>

            <div className={styles.resumen}>
                {cargando ? (
                    <p className={styles.resultados}>Cargando…</p>
                ) : (
                    <p role="status" className={styles.resultados}>
                        {formatCantidad(resultados, "producto", "productos")}
                        {hayFiltrosActivos(filtros) ? " con estos filtros" : ""}
                    </p>
                )}
                {hayFiltrosActivos(filtros) ? (
                    <Button variant="ghost" onClick={onLimpiar}>Limpiar filtros</Button>
                ) : null}
            </div>
        </div>
    );
}
