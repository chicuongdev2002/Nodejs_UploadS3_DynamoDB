const express = require('express');
const multer = require('multer');
const courses = require('./data');
const app = express();
const upload = multer();

// Biến toàn cục để lưu trữ ID hiện tại
let currentId = courses.length+1;

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

app.post('/', upload.fields([]), (req, res) => {
    const newCourse = {
        id: currentId++,
        name: req.body.name,
        course_type: req.body.course_type,
        semester: req.body.semester,
        department: req.body.department
    };

    courses.push(newCourse);
    return res.redirect('/');
});

//delete
app.delete('/courses/:id', (req, res) => {
    const courseId = req.params.id;
    const index = courses.findIndex(course => course.id === courseId);
    if (index !== -1) {
        courses.splice(index, 1);
        res.status(200).send('Khóa học đã được xóa thành công.');
    } else {
        res.status(404).send('Khóa học không tồn tại.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
