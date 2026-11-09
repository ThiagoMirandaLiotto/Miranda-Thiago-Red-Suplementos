class Producto {
    constructor(idProducto, nombre, marca, idCategoria, descripcion, precio, stock, stockMinimo, sabor, imagen, activo) {
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
}

export default Producto;
