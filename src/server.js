import net from "node:net";

const server = net.createServer((socket) => {
    console.log("Client connected");

    let buffer = "";

    socket.on("data", (data) => {
        console.log(data.toString())

        buffer += data.toString();

        while (true) {         // loop so that if data chunk received includes another full request too.

            if (!buffer.includes("\r\n\r\n")) {
                return;
            }

            const headerEndIndex = buffer.indexOf("\r\n\r\n");
            const headerPart = buffer.slice(0, headerEndIndex);

            const request = parseHeaders(headerPart);

            const bodyStartIndex = headerEndIndex + 4;       // body starts after the blank line \r\n\r\n

            let requestEndIndex;
            if (request.headers["Content-Length"]) {

                const contentLength = Number(request.headers["Content-Length"]);
                const availableBody = buffer.slice(bodyStartIndex);
                if (Buffer.byteLength(availableBody) < contentLength) {
                    return;
                }

                const requestBody = buffer.slice(bodyStartIndex, bodyStartIndex + contentLength);

                request.body = parseBody(request.headers["Content-Type"], requestBody);

                requestEndIndex = bodyStartIndex + contentLength;
            }
            else {
                requestEndIndex = bodyStartIndex; // next request starts after the blank line \r\n\r\n
            }

            buffer = buffer.slice(requestEndIndex);     // removing the current request from buffer after it is parsed

            console.log(request);

            socket.write(
                "HTTP/1.1 200 OK\r\n" +
                "Content-Type: application/json\r\n" +
                `Content-Length: ${responseContentLength}\r\n\r\n` +
                responseBody
            );
        }
    });
});

const responseBody = JSON.stringify({
    message: "This is my HTTP response"
});

const responseContentLength = Buffer.byteLength(responseBody);

function parseHeaders(headerPart) {
    const lines = headerPart.split("\r\n");
    const requestLine = lines[0].split(" ");
    const header = {};

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
    return request;
}

function parseBody(contentType, requestBody) {
    if (contentType === "application/json") {
        return JSON.parse(requestBody)
    }
    return requestBody;
}

server.listen(3000);