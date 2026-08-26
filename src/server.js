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


            const lines = headerPart.split("\r\n");
            const requestLine = lines[0].split(" ");
            const header = {};
            const bodyStartIndex = headerEndIndex + 4;       // body starts after the blank line \r\n\r\n

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

                const contentLength = Number(request.headers["Content-Length"]);
                const availaibleBody = buffer.slice(bodyStartIndex);
                if (Buffer.byteLength(availaibleBody) < contentLength) {
                    return;
                }

                const requestBody = buffer.slice(bodyStartIndex, bodyStartIndex + contentLength);

                if (request.headers["Content-Type"] === "application/json") {
                    request.body = JSON.parse(requestBody)
                } else {
                    request.body = requestBody;
                }
                const requestEndIndex = bodyStartIndex + contentLength;
                buffer = buffer.slice(requestEndIndex);     // removing the current request from buffer after it is parsed
            }
            else {
                const requestEndIndex = headerEndIndex + 4; // next request starts after the blank line \r\n\r\n
                buffer = buffer.slice(requestEndIndex);
            }

            console.log(request);

            socket.write(
                "HTTP/1.1 200 OK\r\n" +
                "Content-Type: application/json\r\n" +
                `Content-Length: ${contentLength}\r\n\r\n` +
                responseBody
            );
        }
    });
});

const responseBody = JSON.stringify({
    message: "This is my HTTP response"
});

const contentLength = Buffer.byteLength(responseBody);

server.listen(3000);