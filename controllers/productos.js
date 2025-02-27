import { response, request } from "express";
import Producto from "../models/producto.js";

//Get para traer todos los productos paginados--------------------
const obtenerProductos = async (req = request, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  const productos = await Producto.find(query)
    .skip(Number(desde))
    .limit(Number(limite))
    .populate("categoria", "nombre")
    .populate("usuario", "email");

  const total = await Producto.countDocuments(query);

  res.json({
    total,
    productos,
  });
};

//--------------------------------------------------------------
//obtener un producto por su ID
const obtenerProducto = async (req = request, res = response) => {
  const { id } = req.params;

  const producto = await Producto.findById(id)
    .populate("categoria", "nombre")
    .populate("usuario", "email");

  res.json({
    producto,
  });
};

const productoPost = async (req, res) => {
  const { precio, categoria, descripcion, img, stock } = req.body;

  const nombre = req.body.nombre.toUpperCase();

  const productoDB = await Producto.findOne({ nombre });

  if (productoDB) {
    return res.status(400).json({
      msg: `El producto ${productoDB.nombre} ya existe`,
    });
  }
  //Generar la data a guardar
  const data = {
    nombre,
    categoria,
    precio,
    descripcion,
    img,
    stock,
    usuario: req.usuario._id,
  };

  const producto = new Producto(data);

  //grabar en la base de datos
  await producto.save();

  res.status(201).json({
    msg: "Se agregó producto",
  });
};

//actualizarProducto (validar nombre)-----------------------------------------

const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { precio, categoria, descripcion, disponible, estado } = req.body;
  const usuario = req.usuario._id;

  let data = {
    precio,
    descripcion,
    categoria,
    disponible,
    usuario,
    estado,
  };

  if (req.body.nombre) {
    data.nombre = req.body.nombre.toUpperCase();
  }

  if (req.body.stock) {
    data.stock = req.body.stock;
  }
  if (req.body.img) {
    data.img = req.body.img;
  }

  const producto = await Producto.findByIdAndUpdate(id, data, { new: true })
    .populate("categoria", "nombre")
    .populate("usuario", "email");

  res.status(200).json(producto);
};

//Borrar producto-----------------------------------------------------
const borrarProducto = async (req, res) => {
  const { id } = req.params;

  const productoBorrado = await Producto.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  res.json({
    productoBorrado,
  });
};

export {
  productoPost,
  obtenerProductos,
  obtenerProducto,
  actualizarProducto,
  borrarProducto,
};
