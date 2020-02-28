const cors = require("cors");
const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");

const app = express();
const certDirPath = "./.dev";
const port = 8082;

app.use(cors());
app.use(express.json({ limit: "50MB" }));

app.post("/remote-logger", (req, res) => {
  fs.writeFileSync("./logs.txt", req.body.join("\n"), {
    flag: "a"
  });

  res.sendStatus(201);
});

if (certDirPath) {
  const tlsCertPath = `${certDirPath}/dev.crt`;
  const tlsKeyPath = `${certDirPath}/dev.key`;

  try {
    const files = fs.readdirSync(certDirPath);

    const ca = files.filter(file => {
      return file.startsWith("i") && file.endsWith(".crt");
    });

    const tls = {
      key: fs.readFileSync(tlsKeyPath, "utf8"),
      cert: fs.readFileSync(tlsCertPath, "utf8")
    };

    if (ca) {
      tls.ca = ca.map(c => {
        return fs.readFileSync(`${certDirPath}/${c}`, "utf8");
      });
    }

    const httpsServer = https.createServer(tls, app);
    httpsServer.listen(port);
    console.log(`Listening (https) on port ${port}`);
    return;
  } catch (e) {
    console.error("Could not start server in https mode: ", e);
  }
}

const httpServer = http.createServer(app);
httpServer.listen(port);
console.log(`Listening (http) on port ${port}`);