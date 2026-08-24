import net from "node:net";

const server = net.createServer( (socket) => {
    console.log("Client connected");
    
    socket.on( "data", (data) => {
    console.log(data.toString())
    
   
    const lines = data.toString().split("\r\n");
    const emptyLineIndex = lines.indexOf("")
    const requestLine = lines[0].split(" ");
    const header = {};        
    const bodyArray = lines.slice(emptyLineIndex + 1);
    const requestBody = bodyArray.join("\r\n");

    for(let i = 1; i < lines.length; i++){
        if (lines[i] === ""){
            break;
            }         
            const colonIndex = lines[i].indexOf(":");
            const key = lines[i].slice(0, colonIndex);
            const value = lines[i].slice(colonIndex + 1).trim();
            header[key] = value;
    };

    const request = {
        method: requestLine[0],
        path: requestLine[1],
        version: requestLine[2],
        headers: header,
    };

    if(request.headers["Content-Type"]==="application/json"){
        request.body = JSON.parse(requestBody)
    }else
        request.body = requestBody;

    console.log(request);
                
    socket.write(
        "HTTP/1.1 200 OK\r\n" + 
        "Content-Type: application/json\r\n"+
        `Content-Length: ${contentLength}\r\n\r\n`+
        responseBody
    );
    });
});

const responseBody =  JSON.stringify( {
            message: "This is my HTTP response"});

const contentLength = Buffer.byteLength(responseBody);

server.listen(3000);