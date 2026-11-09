export default class Producto {
    constructor({ idProducto, nombre, marca = "", idCategoria, descripcion = "",
        precio, stock, stockMinimo = 0, sabor = "", imagen = "", activo = true }) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.marca = marca;
        this.idCategoria = idCategoria;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.stockMinimo = stockMinimo;
        this.sabor = sabor;
        this.imagen = imagen;
        this.activo = activo;
    }

    hayStock(cantidad) {
        return this.activo && Number.isSafeInteger(cantidad)
            && cantidad > 0 && cantidad <= this.stock;
    }

    stockCritico() {
        return this.stock < this.stockMinimo;
    }
}
