var express = require("express");
var app = express();
var router = express.Router();
const PaginasController = require("../controller/PaginasController");


router.get("/atualizar",PaginasController.carregarPaginaAtualizar)
router.post("/atualizarNoticias" ,PaginasController.atualizarNoticiasCodigo)

router.get("/noticias/pagina/:pagina?", PaginasController.carregarPaginaNoticias)

router.get("/noticias/ler-mais/:tituloNoticia", PaginasController.carregarPaginaLerMais)

router.get("/noticias/data/:data", PaginasController.carregarPaginaData)

module.exports = router;