const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer();
// Cấu hình aws DynamoDB
const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIA6GBMFE2DOCWHYX4N',
    secretAccessKey:'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',
    region:'ap-southeast-2'
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName ='MonHoc';
//register middlewares
app.use(express.json({ extended: false }));
app.use(express.static('./templates'));

//config view
app.set('view engine', 'ejs');
app.set('views', './templates');

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
//add
app.post('/', upload.fields([]), (req, res) => {
    const{id,name, course_type,semester,department} = req.body;
    const params = {
        TableName: tableName,
        Item: {
            "id":id,
    'name':name,
    'course_type':course_type,
        'semester':semester,
        'department':department
        }
    }
    docClient.put(params, (err, data) => {
        if(err){
            return res.send('Internal Server Error')
        }else{
            return res.redirect("/");
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
