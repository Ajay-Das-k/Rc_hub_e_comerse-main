const Brand = require('../models/brandModel');

const brandDashboard = async(req,res) => {

   try {
 
     var search = '';                    //<----this is where we search for the brand in dashboard 
     if(req.query.search){          
       search = req.query.search;
     }
 
     var page = 1;
     if(req.query.page){
       page = req.query.page;
     }
 
     const limit = 100;           ///<----PAGINATION------------>//
 
     const brandData = await Brand.find({ 
       
      $or: [
        { brandName: { $regex: '.*' + search + '.*', $options: 'i' } }
      ]
     })
     .limit(limit * 1)
     .skip((page-1) * limit)
     .exec();
 
     const count = await Brand.find({ 
       
       $or: [
         { brandName: { $regex: '.*' + search + '.*', $options: 'i' } }, // Case-insensitive search
        
       ]
     }).countDocuments();

   
     res.render('brandDashboard',{
      brandCount:count,
       brand: brandData,
       totalPages: Math.ceil(count/limit),
       currentPage: page
     });
 
   }catch(error){
     console.log(error.message);
throw new Error(error); 
   }
 
 };
 
//* Add New brand Load

const newBrandLoad = async(req,res)=>{
   try {    
       res.render('new-brand');
   } catch (error) {
       console.log(error.message);
throw new Error(error);
   }
}
//* Add New brand
const addBrand = async (req, res) => {
  try {
    console.log(req.body,"-----------------------------------");
    const brandName = req.body.brandName;
    const specification = req.body.specification;
    const coverPic = req.file.filename;
    const existingBrand = await Brand.findOne({ brandName: brandName });
    if (existingBrand) {
      return res.render('new-brand', { message: "Brand already exists." });
    }
    const brand = new Brand({
      brandName: brandName,
      specification: specification,
      coverPic: coverPic,
    });
    const brandData = await brand.save();
    if (brandData) {
      res.redirect('/admin/brandDashboard');
    } else {
      res.render('new-brand', { message: 'Something went wrong.' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};


// edit brand functionality

 const editBrandLoad = async(req,res)=>{

   try {
       const id = req.query.id;
       const brandData = await Brand.findById({ _id:id });
       if(brandData){
           res.render('edit-brand',{brand:brandData });           
       }
       else{
           res.redirect('/admin/brandDashboard');
       }

   } catch (error) {
       console.log(error.message);
throw new Error(error);
   }

}

const updateBrand = async(req,res)=>{
  try {

      if(req.file)
      {
       const brandData = await Brand.findByIdAndUpdate(
          { _id:req.body.id },
          { $set:
              { brandName : req.body.brandName, 
                specification :req.body.specification,
                coverPic : req.file.filename,
               is_block:req.body.is_block,
             }});}else{
               const brandData = await Brand.findByIdAndUpdate(
                 { _id:req.body.id },
                 { $set:
                     { brandName : req.body.brandName, 
                      specification :req.body.specification,
                     is_block:req.body.is_block,
                    }});

             }    
      res.redirect('/admin/brandDashboard');

  } catch (error) {
      console.log(error.message);
throw new Error(error);
  }
}

module.exports={
  brandDashboard,
  newBrandLoad,
  addBrand,
  editBrandLoad,
  updateBrand
                }