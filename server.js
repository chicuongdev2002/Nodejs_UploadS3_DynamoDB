const express = require('express');
const multer = require('multer');
const coursesData = require('./data');
const app = express();
const upload = multer();

// Biến toàn cục để lưu trữ ID hiện tại
let currentId = coursesData.length+1;
let courses = [...coursesData];
//register middlewares
app.use(express.json({ extended: false }));
app.use(express.static('./templates'));

//config view
app.set('view engine', 'ejs');
app.set('views', './templates');

//router
app.get('/', (req, res) => {
    return res.render('index', { data: courses });
});

app.post('/', upload.single('image'), (req, res) => {
    const newCourse = {
        id: currentId++,
        name: req.body.name,
        course_type: req.body.course_type,
        semester: req.body.semester,
        department: req.body.department,
        image: req.file ? req.file.filename : null
    };

    courses.push(newCourse);
    return res.redirect('/');
});

//delete
app.post('/delete', upload.fields([]), (req, res) => {
    //Lấy list bao gồm các ô checkbox
    const listItems = Object.keys(req.body);
    console.log(listItems);
    //Nếu không chọn vào check box trả về trang ban đầu
    if(listItems.length === 0){
        return res.redirect("/")
    }
    courses = courses.filter(item => !listItems.includes(item.id.toString()));
    return res.redirect("/");
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
