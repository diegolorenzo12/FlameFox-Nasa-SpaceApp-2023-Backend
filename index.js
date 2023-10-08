require("dotenv").config()
const {PORT} = require("./src/configs/ws")






const app = require('./src/app')

app.listen(1080, () =>{
    console.log("Server started on port " + PORT)
})