const express=require('express');
const cors =require('cors');
const PORT=8000;

const app=express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cors());

//db
const connect =require('./db/connection');
connect();

//routes
app.use('/api/user',require('./routes/user'));
app.use('/api/board',require('./routes/board'));
app.use('/api/conversation',require('./routes/conversation'));
app.use('/api/request',require('./routes/request'));

app.listen(PORT,()=>{
    console.log(`server started on port ${PORT}`);
})

