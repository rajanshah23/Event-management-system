const app=require("./src/app")
const envConfig=require('./config/config')
envConfig;
function startServer(){
    const port=envConfig.portNumber
    app.listen(port, function(){
        console.log(`Server has started at port:http://localhost:${port}`)
})
}
startServer();