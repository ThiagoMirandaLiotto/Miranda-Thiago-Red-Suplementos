import { useState } from "react";
import TextField from "../ui/TextField.jsx";
import TextAreaField from "../ui/TextAreaField.jsx";
import SelectField from "../ui/SelectField.jsx";
import Button from "../ui/Button.jsx";
import ProductoImagen from "./ProductoImagen.jsx";
import { LIMITES, parsePrecio, validarProducto } from "../../utils/validarProducto.js";
import { VALORES_INICIALES, toProductoPayload } from "../../utils/productoPayload.js";
import { notify } from "../../utils/notify.js";
import styles from "./ProductoForm.module.css";

// Orden de los campos en pantalla: al enviar con errores, el foco va al primero.
const ORDEN_CAMPOS = ["nombre", "idCategoria", "marca", "sabor", "precio", "stock", "stockMinimo", "imagen", "descripcion"];

const MENSAJE_DUPLICADO = "Ya hay un producto activo con este nombre, marca, sabor y categoría.";

// Formulario de alta y edición. "guardar" recibe el payload listo para la API
// y devuelve el producto guardado; "onGuardado" decide qué pasa después.
export default function ProductoForm({
    valoresIniciales = VALORES_INICIALES,
    categorias,
    guardar,
    onGuardado,
    textoGuardar,
    textoGuardando
}) {
    const [valores, setValores] = useState(valoresIniciales);
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    function cambiar(event) {
        const { name, value } = event.target;
        const nuevos = { ...valores, [name]: value };
        setValores(nuevos);
        // Si el campo ya mostraba un error, se revalida mientras se corrige.
        if (errores[name]) {
            setErrores((anteriores) => ({ ...anteriores, [name]: validarProducto(nuevos).errores[name] }));
        }
    }

    function alSalir(event) {
        const { name } = event.target;
        if (valores[name] === VALORES_INICIALES[name] && !errores[name]) return;
        setErrores((anteriores) => ({ ...anteriores, [name]: validarProducto(valores).errores[name] }));
    }

    async function enviar(event) {
        event.preventDefault();
        if (enviando) return;
        const form = event.currentTarget;
        const { errores: encontrados, valido } = validarProducto(valores);
        setErrores(encontrados);

        if (!valido) {
            const cantidad = Object.keys(encontrados).length;
            notify.error(cantidad === 1 ? "Revisá el campo marcado." : `Revisá los ${cantidad} campos marcados.`, { id: "validacion-producto" });
            form.elements.namedItem(ORDEN_CAMPOS.find((campo) => encontrados[campo]))?.focus();
            return;
        }

        setEnviando(true);
        try {
            const producto = await guardar(toProductoPayload(valores));
            onGuardado(producto);
        } catch (error) {
            if (error.status === 409) {
                setErrores((anteriores) => ({ ...anteriores, nombre: MENSAJE_DUPLICADO }));
                form.elements.namedItem("nombre")?.focus();
            }
            notify.error(error, { id: "guardar-producto" });
            setEnviando(false);
        }
    }

    const campo = (nombre) => ({
        name: nombre,
        value: valores[nombre],
        onChange: cambiar,
        onBlur: alSalir,
        error: errores[nombre],
        autoComplete: "off"
    });

    const nombreCategoria = categorias.find((categoria) => String(categoria.idCategoria) === valores.idCategoria)?.nombre ?? "";
    const imagenValida = valores.imagen.trim() !== "" && !validarProducto(valores).errores.imagen;

    return (
        <form className={styles.form} onSubmit={enviar} noValidate>
            <fieldset className={styles.grupo}>
                <legend className={styles.leyenda}>Datos del producto</legend>
                <TextField
                    label="Nombre"
                    required
                    {...campo("nombre")}
                    maxLength={LIMITES.nombre + 20}
                    contador={`${valores.nombre.trim().length}/${LIMITES.nombre}`}
                    hint="Incluí la presentación para distinguir productos, por ejemplo «Creatina 300 g»."
                />
                <SelectField
                    label="Categoría"
                    required
                    {...campo("idCategoria")}
                    placeholder="Elegí una categoría"
                    options={categorias.map((categoria) => ({ valor: String(categoria.idCategoria), etiqueta: categoria.nombre }))}
                />
                <div className={styles.dupla}>
                    <TextField label="Marca" {...campo("marca")} />
                    <TextField label="Sabor" {...campo("sabor")} hint="Por ejemplo: Chocolate o Sin sabor." />
                </div>
            </fieldset>

            <fieldset className={styles.grupo}>
                <legend className={styles.leyenda}>Precio y stock</legend>
                <TextField
                    label="Precio"
                    required
                    {...campo("precio")}
                    inputMode="decimal"
                    hint="En pesos. Para los decimales usá coma o punto, por ejemplo 25000,50."
                />
                <div className={styles.dupla}>
                    <TextField label="Stock" required {...campo("stock")} inputMode="numeric" hint="Unidades disponibles." />
                    <TextField
                        label="Stock mínimo"
                        {...campo("stockMinimo")}
                        inputMode="numeric"
                        hint="Debajo de este número el panel avisa stock bajo. Vacío es 0."
                    />
                </div>
            </fieldset>

            <fieldset className={styles.grupo}>
                <legend className={styles.leyenda}>Presentación</legend>
                <div className={styles.imagenFila}>
                    <TextField
                        label="Imagen"
                        type="url"
                        {...campo("imagen")}
                        hint="URL que empiece con https:// o ruta dentro de public, como /img/productos/whey.webp. Sin imagen se muestra una ilustración."
                    />
                    <div className={styles.vista} aria-hidden="true">
                        <ProductoImagen
                            key={imagenValida ? valores.imagen : "placa"}
                            producto={{
                                nombre: valores.nombre,
                                marca: valores.marca,
                                idCategoria: Number(valores.idCategoria),
                                imagen: imagenValida ? valores.imagen.trim() : "",
                                precio: parsePrecio(valores.precio).valor ?? 0
                            }}
                            categoria={nombreCategoria}
                        />
                    </div>
                </div>
                <TextAreaField
                    label="Descripción"
                    {...campo("descripcion")}
                    maxLength={LIMITES.descripcion + 100}
                    contador={`${valores.descripcion.trim().length}/${LIMITES.descripcion}`}
                    rows={5}
                />
            </fieldset>

            <div className={styles.acciones}>
                <Button type="submit" size="lg" loading={enviando} loadingText={textoGuardando}>
                    {textoGuardar}
                </Button>
                <Button to="/admin/productos" variant="ghost" size="lg">Cancelar</Button>
            </div>
        </form>
    );
}
