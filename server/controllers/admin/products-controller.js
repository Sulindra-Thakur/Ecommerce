const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      seasonal,
      tags,
      weatherDiscountEligible,
    } = req.body;

    // Process tags if provided as a string
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim().toLowerCase());
      } else if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim().toLowerCase());
      }
    }

    // Automatically add the category and brand as tags if not already included
    if (category && !processedTags.includes(category.toLowerCase())) {
      processedTags.push(category.toLowerCase());
    }
    
    if (brand && !processedTags.includes(brand.toLowerCase())) {
      processedTags.push(brand.toLowerCase());
    }
    
    if (seasonal && seasonal !== 'all' && !processedTags.includes(seasonal.toLowerCase())) {
      processedTags.push(seasonal.toLowerCase());
    }

    // Create the product with processed data
    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category: category.toLowerCase(),
      brand: brand.toLowerCase(),
      price: parseFloat(price) || 0,
      salePrice: parseFloat(salePrice) || 0,
      totalStock: parseInt(totalStock) || 0,
      averageReview: parseFloat(averageReview) || 0,
      seasonal: seasonal ? seasonal.toLowerCase() : 'all',
      tags: processedTags,
      weatherDiscountEligible: weatherDiscountEligible !== undefined ? weatherDiscountEligible : true,
    });

    console.log("Creating new product:", newlyCreatedProduct);
    await newlyCreatedProduct.save();
    
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log("Error adding product:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding product",
      error: e.message
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      seasonal,
      tags,
      weatherDiscountEligible,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    // Process tags if provided
    let processedTags = findProduct.tags || [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim().toLowerCase());
      } else if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim().toLowerCase());
      }
      
      // Ensure category and brand are included in tags
      if (category && !processedTags.includes(category.toLowerCase())) {
        processedTags.push(category.toLowerCase());
      }
      
      if (brand && !processedTags.includes(brand.toLowerCase())) {
        processedTags.push(brand.toLowerCase());
      }
      
      if (seasonal && seasonal !== 'all' && !processedTags.includes(seasonal.toLowerCase())) {
        processedTags.push(seasonal.toLowerCase());
      }
    }

    // Update product fields
    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category ? category.toLowerCase() : findProduct.category;
    findProduct.brand = brand ? brand.toLowerCase() : findProduct.brand;
    findProduct.price = price !== undefined ? parseFloat(price) : findProduct.price;
    findProduct.salePrice = salePrice !== undefined ? parseFloat(salePrice) : findProduct.salePrice;
    findProduct.totalStock = totalStock !== undefined ? parseInt(totalStock) : findProduct.totalStock;
    findProduct.image = image || findProduct.image;
    findProduct.averageReview = averageReview !== undefined ? parseFloat(averageReview) : findProduct.averageReview;
    findProduct.seasonal = seasonal ? seasonal.toLowerCase() : findProduct.seasonal;
    findProduct.tags = processedTags;
    findProduct.weatherDiscountEligible = weatherDiscountEligible !== undefined ? weatherDiscountEligible : findProduct.weatherDiscountEligible;

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log("Error editing product:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while editing product",
      error: e.message
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
