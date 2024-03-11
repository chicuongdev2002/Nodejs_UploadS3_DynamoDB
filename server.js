//Khai báo thư viện
const express = require('express');
const multer = require('multer');
const app = express();
require('dotenv').config();
// Cấu hình aws DynamoDB
const AWS = require('aws-sdk');
//Cấu hình aws
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE="1"
const { required } = require('nodemon/lib/config');
const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey:process.env.SECRET_ACCESS_KEY,
    region:process.env.REGION
});
AWS.config = config;
//S3 Lưu trữ ảnh
const S3=new AWS.S3();
//DynamoDB
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName ='MonHoc';
const path=require('path')
//Lưu trữ S3
const buketname=process.env.S3_BUCKET_NAME
//Cấu hình middleware
app.use(express.json({ extended: false }));
app.use(express.static('./templates'));

//Cấu hình hiển thị
app.set('view engine', 'ejs');
app.set('views', './templates');
//Cấu hình multer quản lí upload image
const storage=multer.memoryStorage({
    destination(req,file,callback){
        callback(null,"")
    },
});
const upload =multer({
    storage,
    limits:{fileSize:2000000},
    fileFilter(req,file,cb){
        checkFileType(file,cb);
    },
});
function checkFileType(file,cb){
    const fileType=/jpeg|jpg|png|gif/;
    const extname=fileType.test(path.extname(file.originalname).toLowerCase());
    const mimetype =fileType.test(file.mimetype);
    if(extname && mimetype){
        return cb(null,true);
    }
    return cb("Error:Pls upload images /jpeg|jpg|png|gif/ only!");


}
//Get
app.get('/', (req, res) => {
    const params ={
        TableName: tableName,
    };
    docClient.scan(params, (err, data) => {
        if(err){
            res.send('Internal Server Error');
        }else{
            return res.render('index', {data: data.Items});
        }
    });

});
//Thêm
app.post('/', upload.single('image'), (req, res) => {
    const{id,name, course_type,semester,department} = req.body;
  const image=req.file?.originalname.split(".");
  const fileType=image[image.length-1];
  const filePath=`${id}_${Date.now().toString()}.${fileType}`;
  const paramS3={
    Bucket:buketname,
    Key:filePath,
    Body:req.file.buffer,
    ContentType:req.file.mimetype,
  };
  S3.upload(paramS3,async(err,data)=>{
    console.log(err);
    if(err) {return res.send("Internal server eror");
  }else
  {
const image =data.Location;
    const params = {
        TableName: tableName,
        Item: {
            "id":id,
    'name':name,
    'course_type':course_type,
        'semester':semester,
        'department':department,
        'image':image
        }
    }
    docClient.put(params, (err, data) => {
        if(err){
            return res.send('Internal Server Error')
        }else{
            return res.redirect("/");
        }
    })
    }
    })
});
//delete
app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);
    if(listItems.length === 0){
        return res.redirect("/")
    }
    function onDeleteItem(index){
        const params = {
            TableName: tableName,
            Key:{
                "id": listItems[index]
            }
        }
    docClient.delete(params, (err, data) => {
        if(err){
            return res.send('Internal Server Error')
        }else{
            if(index > 0){
                onDeleteItem(index - 1);
            }else{
                return res.redirect("/");
            }
            
        }
    })
}
    onDeleteItem(listItems.length - 1);
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
