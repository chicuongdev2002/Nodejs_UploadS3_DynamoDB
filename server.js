const express=require('express');
const courses=require('./data');
const app=express();
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
app.post('/',(req,res)=>{
   console.log(req.body);
});
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});
