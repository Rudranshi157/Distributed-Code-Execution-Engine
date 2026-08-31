const { WebSocketServer } = require("ws");
const { redisSubscribe } = require("./redis");
const { randomUUID } = require("crypto");

const redis_channel = "job-status";
const PORT = process.env.PORT ?? 9000;

const clients = new Map();

const wsServer = new WebSocketServer({port : PORT});

redisSubscribe.subscribe(redis_channel);

wsServer.on("connection", (webSocket) => {
    const clientId = randomUUID();
    clients.set(clientId, webSocket);
    console.log(`ws client connected ${clientId}`);
    webSocket.send(JSON.stringify({
        type: "client-id",
        clientId
    }));
    webSocket.on("close", ()=> {
    clients.delete(clientId);
    console.log(`ws client disconnected: ${clientId}`);
})
})
redisSubscribe.on("message", (channel, msg) =>{
    if(channel !== redis_channel){
        return;
    }
    console.log(channel);
    console.log(msg);
    const data = JSON.parse(msg);
    
    //Dashboard update message
    if(data.type === "submission-updated"){
        for(const webSocket of clients.values()){
            if(webSocket.readyState === 1){
                webSocket.send(msg);
            }
        }
        return;
    }

    //Normal execution status msg
    const webSocket = clients.get(data.clientId);

    if(webSocket && webSocket.readyState === 1){
        webSocket.send(msg);
    }
    

});

