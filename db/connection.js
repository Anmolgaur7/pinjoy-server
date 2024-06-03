const mongoose=require('mongoose')
const URI='mongodb+srv://anmolgaur26:cristiano7@cluster0.pptxhgl.mongodb.net/?retryWrites=true&w=majority'

const connectdb=async ()=>{
    try {
        await mongoose.connect(URI);
        console.log("db connected");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

module.exports=connectdb

