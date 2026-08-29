import cloudinary from "../Config/cloudinary.js";
import productModel from "../Models/ProductModel.js";
import mongoose from "mongoose";

const addProduct = async (req, res) => {
  try {

    // console.log("BODY:", req.body);
    // console.log("FILES:", req.files);

    const { name, description, price, category, stock } = req.body;

    // Get all image fields (image1, image2, image3, image4)
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );
    
    if (images.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "At least one image is required" 
      });
    }

    let imageUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const productData = new productModel({
      name,
      description,
      price: Number(price),
      imageUrl: imageUrl,
      category,
      stock: Number(stock) || 0,
      date: Date.now(),
    });

    console.log("Product created:", productData);

    await productData.save();

    res.json({ success: true, message: "Product added successfully" });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to add product" });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // update fields
    const fields = ["name", "description", "category"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        product[f] = req.body[f];
      }
    });

    if (req.body.price !== undefined) {
      product.price = Number(req.body.price);
    }

    if (req.body.stock !== undefined) {
      product.stock = Number(req.body.stock);
    }

    // upload new images if provided
    if (req.files && Object.keys(req.files).length > 0) {
      const newImages = [];

      for (const key in req.files) {
        for (const file of req.files[key]) {
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "image",
          });
          newImages.push(result.secure_url);
        }
      }

      product.imageUrl = product.imageUrl.concat(newImages);
    }

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("Edit product error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to edit product",
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await productModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

const singleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Invalid Mongo ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await productModel.findById(id);

    // Product not found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,   
        category: product.category,
        stock: product.stock,
        createdAt: product.date,
      },
    });
  } catch (err) {
    console.error("Single product error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};


//func for list product
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};


export { addProduct, editProduct, deleteProduct,singleProduct,listProduct};
