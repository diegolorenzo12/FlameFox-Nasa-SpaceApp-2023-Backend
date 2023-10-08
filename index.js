require("dotenv").config()





const app = require('./src/app')

app.listen(1080, () =>{
    console.log("Server started")
})