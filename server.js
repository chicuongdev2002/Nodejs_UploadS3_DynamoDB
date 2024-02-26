const express=require('express');
const muter=require('multer');
const courses=require('./data');
const app=express();
const upload=muter();
//register middlewares
app.use(express.json({extended:false}));
app.use(express.static('./templates'));
//config view
app.set('view engine','ejs');
app.set('views','./templates');
//router
app.get('/',(req,res)=>{
    return res.render('index',{data:courses});
});
app.post('/',upload.fields([]),(req,res)=>{
  courses.push(req.body);
  return res.redirect('/');
});
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});
