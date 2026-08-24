import net from "node:net";

const server = net.createServer( (socket) => {
    console.log("Client connected");
    
    socket.on( "data", (data) => {
    console.log(data.toString())
    
    socket.write(
        "HTTP/1.1 200 OK\r\n" + 
        "Content-Type: application/json\r\n"+
        `Content-Length: ${contentLength}\r\n\r\n`+
        body
    );
    });
});

const body =  JSON.stringify( {
            message: "This is my HTTP response"});

const contentLength = Buffer.byteLength(body);

server.listen(3000);