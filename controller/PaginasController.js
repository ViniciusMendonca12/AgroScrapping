var Noticias = require("../models/NoticiasModel")
const NoticiasController = require("../controller/NoticiasController");


class PaginasController{

   async carregarPaginaNoticias(req, res){
    try {
        var pagina = req.params.pagina || 1
        var noticias = await Noticias.exibirNoticiasPaginas(pagina)
        var ultimasNoticias = await Noticias.ultimasNoticias()
        var datasPublicacao = await Noticias.pegarTodasDatasDePublicacao()
        res.render('noticias.ejs' , {noticias:noticias, ultimasNoticias: ultimasNoticias, datasPublicacao:datasPublicacao});

    } catch (error) {
        console.log("Erro interno no servidor ao carregar página de noticias")
    }
        
    }  
    
    async carregarPaginaLerMais(req, res){
        var tituloNoticia = req.params.tituloNoticia
        var noticiaLerMais = await Noticias.exibirNoticiaLerMais(tituloNoticia) 
        var outrasNoticias = await Noticias.exibirOutrasNoticias()
        res.render('noticias/lerMaisNoticia.ejs', {noticia: noticiaLerMais,outrasNoticias:outrasNoticias });
    } 

    async carregarPaginaAtualizar(req, res){
        res.render('noticias/atualizar.ejs',);
    } 

    async atualizarNoticiasCodigo(req,res){
        var codigoSecreto = req.body.codigoSecreto
        if(codigoSecreto == "atualizar"){
           var atualizar = await NoticiasController.salvaNoticias()
           if(atualizar.status){
            res.redirect("/noticias/pagina/1/?sucesso=1")
           }
        }else{
            res.redirect("/noticias/pagina/1/?erro=1")
        }
    }

    async carregarPaginaData(req, res){
        var dataNoticia = req.params.data.replace(/-/g, '/')
        var noticiasPorData = await Noticias.exibirNoticiasPorData(dataNoticia) 
        var outrasNoticias = await Noticias.exibirOutrasNoticias()
        res.render('noticias/noticiasPorData.ejs', {noticiasPorData:noticiasPorData, outrasNoticias:outrasNoticias });
    } 


}

module.exports = new PaginasController()