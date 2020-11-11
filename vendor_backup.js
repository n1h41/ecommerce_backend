const router = require('express').Router()
const Product = require('../models/product')
const ImageDetails = require('../models/imagedetails')
const User = require('../models/user')
const authenticate = require('./verifyToken')
const path = require('path')
const multer = require('multer')
const { productdetailsValidation } = require('../validation')
const { isVendor } = require('./verifyUserRole')
const fs = require('fs')

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
router.post('/addproducts', authenticate, isVendor, upload.array('product-image', 2), async (req, res) => {

    const filenames = []

    //validation
    const { error } = productdetailsValidation(req.body)
    if (error) return res.send(error.details[0].message)

    //to get file name of each uploaded files
    const image_url_array = []
    for (let i = 0; i < req.files.length; i++) {
        image_url_array.push(`http://10.0.2.2:3000/images/${req.files[i].filename}`)
        filenames.push(req.files[i].filename)
    }

    //uploading request data into the model
    const product = new Product({
        product_name: req.body.product_name,
        price: Number(req.body.price),
        image_url: image_url_array,
        pincode: Number(req.body.pincode),
        category: req.body.category,
        vendor: req.user
    })

    //saving the model instance
    try {
        savedProduct = await product.save()
        res.send(savedProduct)
        //
        const imagedetail = new ImageDetails({
            filenames: filenames,
            product_id: savedProduct._id
        })
        savedImageDetail = await imagedetail.save()
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

                // Deleting the image files while deleting the record
                const imageFilesToDelete = await ImageDetails.findOne({ product_id: vendor_product_list[i]._id })
                for (let i = 0; i < imageFilesToDelete.filenames.length; i++) {
                    const path = `./uploads/images/${imageFilesToDelete.filenames[i]}`
                    fs.unlink(path, (err) => {
                        if (err) {
                            console.log(err)
                            return
                        }
                    })
                }

                //Deleting the record
                //Getting the product name
                try {
                    Product_name = await Product.findOne({ _id: req.params.id })
                    /* Vendor = await User.findOne({ _id: req.user._id }) */
                }
                catch (err) {
                    res.status(400).send(err)
                }

                console.log(`\nProduct: ${Product_name.product_name} deleted by Vendor: ${user.name}`)
                const result = await Product.findByIdAndDelete(id)
                res.send(result)
                flag = 1
                break
            }
            /* else{
                res.status(400).send("Product Doesn't Exist")
            } */
        }
        if (flag == 0) { res.status(400).send("Product Doesn't Exist") }
    }
    catch (err) {
        res.status(400).send(err)
    }
})

//update product details
router.patch('/products/update/:id', authenticate, isVendor, async (req, res) => {
    flag = 0
    const updates = req.body
    const product_id = req.params.id
    try {
        user_id = req.user._id
        
        // checking if the vendor is updating his own product or not
        const product_list = await Product.find({ vendor: user_id })
        for (let i = 0; i < product_list.length; i++) {
            if(product_id == product_list[i]._id){

                // updating product details
                updated_product = await Product.findByIdAndUpdate(product_id, updates, { useFindAndModify:false })
                flag = 1
                res.send(updated_product)
            }
        }
        if (flag == 0 ){
            res.status(400).send("Product Not Available")
        }
    }
    catch (err) {
        res.status(400).send(err)
    }
})

//testing
router.post('/testing', (req, res)=>{
    console.log(req.body)
})

module.exports = router