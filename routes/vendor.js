const router = require('express').Router()
const Product = require('../models/product')
const authenticate = require('./verifyToken')
const path = require('path')
const multer = require('multer')
const { productDetailsValidation } = require('../validation')
const { isVendor } = require('./verifyUserRole')
const fs = require('fs')
const Category = require('../models/category')

//storage setup for uploading images
const storage = multer.diskStorage({
    destination: './uploads/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({
    storage: storage
})

// Allow vendor to add products
router.post('/addproducts', authenticate, isVendor, upload.array('product-image', 5), async (req, res) => {

    const image_file_names = []

    //validation
    const { error } = productDetailsValidation(req.body)
    if (error) return res.send(error.details[0].message)

    //to get file name of each uploaded files
    const image_url_array = []
    for (let i = 0; i < req.files.length; i++) {
        image_url_array.push(`${process.env.SERVER_URL}/images/${req.files[i].filename}`)
        image_file_names.push(req.files[i].filename)
    }

    //adding product with category value taken from category document in the database
    try {
        category = await Category.findOne({ category_name: req.body.category })
        if(!category) return res.status(400).send(`The category ${req.query.q} doesn't exist. Please add the category.`)
    }
    catch (err) {
        return res.status(400).send(err)
    }

    //uploading request data into the model
    const product = new Product({
        product_name: req.body.product_name,
        price: Number(req.body.price),
        image_url: image_url_array,
        image_file_name: image_file_names,
        pincode: Number(req.user.pincode),
        category: req.body.category,
        vendor: req.user
    })

    //saving the model instance
    try {
        savedProduct = await product.save()
        res.send(savedProduct)
    }
    catch (err) {
        res.status(400).send(err)
    }
})

// get product list of the current vendor
router.get('/products', authenticate, isVendor, async (req, res) => {
    try {
        const productlist = await Product.find({ vendor: req.user._id })
        if (productlist.length == 0) return res.status(400).send('No Products Available to View. Add Products')
        res.send(productlist)
    }
    catch (err) {
        res.status(400).send(err)
    }
})

// delete products
router.delete('/products/delete/:id', authenticate, isVendor, async (req, res) => {
    id = req.params.id
    flag = 0
    //delete after making sure whether the vendor is deleting his own products
    try {
        const vendor_product_list = await Product.find({ vendor: req.user._id })
        if (vendor_product_list.length == 0) return res.status(400).send('No Products Available to Delete. Add Products')
        for (let i = 0; i < vendor_product_list.length; i++) {
            if (id == vendor_product_list[i]._id) {
                //Deleting the record
                try {

                    //Getting the product document
                    Product_name = await Product.findOne({ _id: req.params.id })

                    // Deleting the image files while deleting the record
                    for (let i = 0; i < Product_name.image_file_name.length; i++) {
                        const path = `./uploads/images/${Product_name.image_file_name[i]}`
                        fs.unlink(path, (err) => {
                            if (err) {
                                console.log(err)
                                return
                            }
                        })
                    }
                }
                catch (err) {
                    res.status(400).send(err)
                }

                console.log(`\nProduct: '${Product_name.product_name}' deleted by Vendor: '${user.name}'`)
                const result = await Product.findByIdAndDelete(id)
                res.send(result)
                flag = 1
                break
            }
        }
        if (flag == 0) { res.status(400).send("Product Doesn't Exist") }
    }
    catch (err) {
        res.status(400).send(err)
    }
})

//update product details
router.patch('/products/update/:id', authenticate, isVendor, async (req, res) => {

    //To remove null key:value from the json
    const removeEmptyOrNull = (obj) => {
        Object.keys(obj).forEach(k =>
          (obj[k] && typeof obj[k] === 'object') && removeEmptyOrNull(obj[k]) ||
          (!obj[k] && obj[k] !== undefined) && delete obj[k]
        );
        return obj;
      };
    req.body = removeEmptyOrNull(req.body)
    /* console.log(req.body)
    console.log(req.params.id) */

    flag = 0
    const updates = req.body
    const product_id = req.params.id
    try {
        user_id = req.user._id

        // checking if the vendor is updating his own product or not
        const product_list = await Product.find({ vendor: user_id })
        for (let i = 0; i < product_list.length; i++) {
            if (product_id == product_list[i]._id) {
                // updating product details
                updated_product = await Product.findByIdAndUpdate(product_id, updates, { useFindAndModify: false })
                if(!updated_product) return res.status(400).send("Product not available")
                flag = 1
                res.send(updated_product)
            }
        }
        if (flag == 0) {
            res.status(400).send("Product Not Available")
        }
    }
    catch (err) {
        res.status(400).send(err)
    }
})

//add new category
router.post('/add-category', async (req, res) => {
    
    const category = new Category({
        category_name: req.body.category
    })

    try {

        const savedCategory = await category.save()
        res.send(savedCategory)

    }
    catch (err) {

        if(err.code == 11000) return res.status(400).send(`The category '${req.body.category}' already exists in Application. Please select it from dropdown menu.`)
        else return res.status(400).send(err)

    }

})

//get all all available categories
router.get('/category',authenticate , async (req, res) => {

    const category = await Category.find()
    res.send(category)

})

module.exports = router