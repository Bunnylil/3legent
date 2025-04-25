require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());


mongoose.connect("mongodb+srv://buruklynx:1gliU3JyND0sQoKS@3legant-project.ybsdj.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    countryCode: String,
    phone: String,
    password: String, 
    signupMethod: String, 
  });
  
  const User = mongoose.model("User", userSchema);
  

  const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    rating: Number,
    ratingCount: Number,
    colors: [String],
    gender: String, 
    category: String,
    type: [String],
    sport: [String],
    brand: String,
    sizes: [Number],
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'products' });
  
  const Product = mongoose.model('Product', productSchema);
  


const buildFilterQuery = (queryParams) => {
  const query = {};
  
  
  const arrayFilters = ['gender', 'category', 'type', 'sport', 'brand', 'colors'];
  arrayFilters.forEach(filter => {
    if (queryParams[filter]) {
      const values = Array.isArray(queryParams[filter]) 
        ? queryParams[filter] 
        : [queryParams[filter]];
      
      if (filter === 'type' || filter === 'sport' || filter === 'colors' || filter === 'gender') {
        
        query[filter] = { $in: values };
      } else {
        
        query[filter] = values[0];
      }
    }
  });
    
    
    if (queryParams.minPrice || queryParams.maxPrice) {
      query.price = {};
      if (queryParams.minPrice) query.price.$gte = parseFloat(queryParams.minPrice);
      if (queryParams.maxPrice) query.price.$lte = parseFloat(queryParams.maxPrice);
    }
    
    
    if (queryParams.size) {
      query.sizes = parseInt(queryParams.size);
    }
    
    if (queryParams.gender) {
      query.gender = queryParams.gender;
  }
  
    return query;
  };
  
  
  const buildSortOptions = (sortParam) => {
    switch (sortParam) {
      case 'price-low':
        return { price: 1 }; 
      case 'price-high':
        return { price: -1 }; 
      case 'newest':
        return { createdAt: -1 }; 
      case 'popularity':
      default:
        return { rating: -1, ratingCount: -1 }; 
    }
  };  


app.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, email, countryCode, phone, password, signupMethod } = req.body;

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        let hashedPassword = "";
        if (signupMethod === "manual") {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            countryCode,
            phone,
            password: hashedPassword,
            signupMethod,
        });

        await newUser.save();
        res.status(201).json({ message: "User Registered Successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User is not registered" });
        }

        
        let signInMethod = user.signupMethod || "manual"; 

        
        if (signInMethod === "manual") {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Invalid email or password" });
            }
        }

        res.status(200).json({ message: "Login Successful", user, signInMethod });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/request-password-reset", async (req, res) => {
    try {
      const { email } = req.body;
  
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Generate 4-digit random code (1000-9999)
      const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  
      // In production, you would send this code via email
      console.log(`Reset code for ${email}: ${resetCode}`); // For testing
  
      res.status(200).json({ 
        message: "Reset code generated", 
        resetCode,
        email
      });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update Password Route
app.post("/reset-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
  
// API Endpoint to get products with filtering, sorting and pagination
app.get('/api/products', async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 16, 
        sort = 'popularity',
        ...filters 
      } = req.query;
      
      // Build the filter query
      const filterQuery = buildFilterQuery(filters);
      
      // Build sort options
      const sortOptions = buildSortOptions(sort);
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Get total count of matching products (for pagination)
      const totalCount = await Product.countDocuments(filterQuery);
      
      // Get paginated products
      const products = await Product.find(filterQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(); // Convert to plain JS objects
      
      // Transform products for frontend
      const transformedProducts = products.map(product => ({
        ...product,
        _id: product._id.toString(), // Convert ObjectId to string
        price: parseFloat(product.price.toFixed(2)) // Ensure proper decimal format
      }));
      
      res.json({
        success: true,
        totalCount,
        page: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        products: transformedProducts
      });
      
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  });
  
  // API Endpoint to get filter options (for dynamic filter population)
  app.get('/api/filter-options', async (req, res) => {
    try {
      const genders = await Product.distinct('gender');
      const categories = await Product.distinct('category');
      const types = await Product.distinct('type');
      const sports = await Product.distinct('sport');
      const brands = await Product.distinct('brand');
      const colors = await Product.distinct('colors');
      
      // Get min and max price for range slider
      const priceRange = await Product.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" }
          }
        }
      ]);
      
      res.json({
        success: true,
        genders,
        categories,
        types: [...new Set(types.flat())], // Flatten and dedupe
        sports: [...new Set(sports.flat())], // Flatten and dedupe
        brands,
        colors: [...new Set(colors.flat())], // Flatten and dedupe
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 }
      });
      
    } catch (error) {
      console.error('Error fetching filter options:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching filter options',
        error: error.message
      });
    }
  });
  
  
  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).lean();
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        product: {
          ...product,
          _id: product._id.toString(),
          price: parseFloat(product.price.toFixed(2))
        }
      });
      
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message
      });
    }
  });
  
  
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  });
  

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`- GET /api/products - Get products with filters`);
  console.log(`- GET /api/filter-options - Get available filter options`);
  console.log(`- GET /api/products/:id - Get single product by ID`);
});