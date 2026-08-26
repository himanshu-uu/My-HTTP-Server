import net from "node:net";

const server = net.createServer((socket) => {
    console.log("Client connected");

    let buffer = "";

    socket.on("data", (data) => {
        console.log(data.toString())

        buffer += data.toString();
        if (!buffer.includes("\r\n\r\n")) {
            return;
        }

        const headerEndIndex = buffer.indexOf("\r\n\r\n");
        const headerPart = buffer.slice(0, headerEndIndex);


        const lines = headerPart.split("\r\n");
        const requestLine = lines[0].split(" ");
        const header = {};
        const bodyStartIndex = headerEndIndex + 4;
        const requestBody = buffer.slice(bodyStartIndex);

        for (let i = 1; i < lines.length; i++) {

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

        if (request.headers["Content-Length"]) {
            if (Buffer.byteLength(requestBody) < Number(request.headers["Content-Length"])) {
                return;
            }

            if (request.headers["Content-Type"] === "application/json") {
                request.body = JSON.parse(requestBody)
            } else
                request.body = requestBody;
        }

        console.log(request);

        socket.write(
            "HTTP/1.1 200 OK\r\n" +
            "Content-Type: application/json\r\n" +
            `Content-Length: ${contentLength}\r\n\r\n` +
            responseBody
        );
    });
});

const responseBody = JSON.stringify({
    message: "This is my HTTP response"
});

const contentLength = Buffer.byteLength(responseBody);

server.listen(3000);