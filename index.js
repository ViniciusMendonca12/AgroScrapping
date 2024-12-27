const express = require('express');
const app = express();
var router = require("./routes/routes")
const bodyParser = require("body-parser")
const port = 3000;

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static("public"))
app.use("/", router)


const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const jQuery = require('jquery');

const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>jQuery with Node.js</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <div id="content">This is some content</div>
</body>
</html>
`);

const $ = jQuery(dom.window);

app.get('/', (req, res) => {
  res.redirect('/noticias/pagina/1');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
