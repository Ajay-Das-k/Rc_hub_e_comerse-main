const Banner = require('../models/bannerModel');
const Product = require("../models/productModel");

const bannerDashboard = async(req,res) => {

   try {
 
     var search = '';                    //<----this is where we search for the banner in dashboard 
     if(req.query.search){          
       search = req.query.search;
     }
 
     var page = 1;
     if(req.query.page){
       page = req.query.page;
     }
 
     const limit = 100;           ///<----PAGINATION------------>//
 
     const bannerData = await Banner.find({ 
       
      $or: [
        { bannerName: { $regex: '.*' + search + '.*', $options: 'i' } }
      ]
     })
     .limit(limit * 1)
     .skip((page-1) * limit)
     .populate("product")
     .exec();
 
     const count = await Banner.find({ 
       
       $or: [
         { bannerName: { $regex: '.*' + search + '.*', $options: 'i' } }, // Case-insensitive search
        
       ]
     }).countDocuments();

   
     res.render('bannerDashboard',{
      bannerCount:count,
       banner: bannerData,
       totalPages: Math.ceil(count/limit),
       currentPage: page
     });
 
   }catch(error){
     console.log(error.message);
throw new Error(error); 
   }
 
 };
 
//* Add New banner Load

const newBannerLoad = async(req,res)=>{
   try {
       const productList = await Product.find();
       res.render('new-banner',{product:productList});

   } catch (error) {
       console.log(error.message);
throw new Error(error);
   }
}


//* Add New banner Post function
const addBanner = async (req, res) => {
  try {
    const bannerName = req.body.bannerName;
    const bannerName2 = req.body.bannerName2;
    const specification = req.body.specification;
    const product= req.body.product;
    const coverPic = req.file ? req.file.filename : null;
     // Check if a file is uploaded
    const newBanner = new Banner({
      bannerName: bannerName,
      bannerName2: bannerName2,
      specification: specification,
      product: product,
      coverPic: coverPic,
    });
    console.log(newBanner);
    const bannerData = await newBanner.save();

    if (bannerData) {
      res.redirect('/admin/bannerDashboard');
    } else {
      res.render('new-banner', { message: 'Something went wrong.' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};


// edit banner functionality

 const editBannerLoad = async(req,res)=>{

   try {
    const productList = await Product.find();
       const id = req.query.id;
       const bannerData = await Banner.findById({ _id:id });
       if(bannerData){
           res.render("edit-banner", {
             banner: bannerData,
             product: productList,
           });           
       }
       else{
           res.redirect('/admin/bannerDashboard');
       }

   } catch (error) {
       console.log(error.message);
throw new Error(error);
   }

}

const updateBanner = async(req,res)=>{
  try {

      if(req.file)
      {
       const bannerData = await Banner.findByIdAndUpdate(
         { _id: req.body.id },
         {
           $set: {
             bannerName: req.body.bannerName,
             bannerName2: req.body.bannerName2,
             specification: req.body.specification,
             product: req.body.product,
             coverPic: req.file.filename,
             is_block: req.body.is_block,
           },
         }
       );}else{
               const bannerData = await Banner.findByIdAndUpdate(
                 { _id: req.body.id },
                 {
                   $set: {
                     bannerName: req.body.bannerName,
                     product: req.body.product,
                     bannerName2: req.body.bannerName2,
                     specification: req.body.specification,
                     is_block: req.body.is_block,
                   },
                 }
               );

             }    
      res.redirect('/admin/bannerDashboard');

  } catch (error) {
      console.log(error.message);
throw new Error(error);
  }
}

module.exports={bannerDashboard,
  newBannerLoad,
  addBanner,
  editBannerLoad,
  updateBanner
                }