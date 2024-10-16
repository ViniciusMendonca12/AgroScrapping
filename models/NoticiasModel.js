var knex = require("../database/database")

class Noticias {

    async salvaNoticiasBanco(noticias) {
        try {
            await knex.insert(noticias).into("noticias")
            return { status: true }
        } catch (error) {
            console.log("Erro ao salvar noticia" + error)
            return { status: false }
        }
    }

    async pegaNoticiasBanco() {
        try {
            var noticias = await knex.select("noticias.titulo").table("noticias")
            return noticias
        } catch (error) {
            console.log("Erro ao pegar noticias")
            return []

        }
    }

    async exibirNoticiasPaginas(pagina) {
        try {
            var limiteNoticias = 15
            var passar = (pagina - 1) * limiteNoticias

            var noticias = await knex.select("noticias.*").table("noticias").offset(passar)
                .limit(limiteNoticias).orderBy("id", "desc")

            var quantidadeNoticias = await knex.count("* as totalNoticias").table("noticias").first()

            var paginaJSON = {
                noticias: noticias,
                paginaAtual: pagina,
                totalPaginas: Math.ceil(quantidadeNoticias.totalNoticias / limiteNoticias)
            }
            return paginaJSON

        } catch (error) {
            console.log("Erro ao carregar as noticias para a página")
            return []

        }
    }

    async ultimasNoticias() {
        try {
            var noticias = await knex.select("noticias.*").table("noticias")
                .limit(2).orderBy("id", "desc")
            return noticias
        } catch (error) {
            console.log("Erro ao carregar as ultimas noticias")
            return []
        }

    }

    async exibirNoticiaLerMais(titulo) {
        try {
            var noticiaLerMais = await knex.select("noticias.*").table("noticias")
                .where("noticias.titulo", titulo).first()
            return noticiaLerMais
        } catch (error) {
            console.log("Erro ao carregar ver mais noticias")
            return []
        }
    }

    async exibirOutrasNoticias() {
        try {
            var outrasNoticias = await knex.select("noticias.*").table("noticias")
                .orderByRaw("RAND()").limit(5)
            return outrasNoticias
        } catch (error) {
            console.log("Erro ao carregar outras noticias")
            return []
        }
    }

    async pegarTodasDatasDePublicacao() {
        try {
            var datasPublicacao = await knex('noticias').select('dataPublicacao').orderBy('dataPublicacao', 'desc');

            datasPublicacao = datasPublicacao.map(noticia => {
                return noticia.dataPublicacao.split(' ')[0].replace(/\//g, '-');
            });

            datasPublicacao = [...new Set(datasPublicacao)];

            return datasPublicacao;

        } catch (error) {
            console.log("erro ao pegar as datas de publicação" + error)
            return []
        }

    }

    async exibirNoticiasPorData(dataPublicacao) {
        try {
            let dataFormatada = dataPublicacao.split('/').reverse().join('-');

            var noticiaPorData = await knex.select("noticias.*")
              .table("noticias")
              .where(knex.raw("DATE(STR_TO_DATE(noticias.dataPublicacao, '%d/%m/%Y %H:%i')) = ?", [dataFormatada]));
            
            return noticiaPorData;
            

        } catch (error) {
            console.log("Erro ao carregar noticiasPorData" + error)
            return []
        }
    }



}

module.exports = new Noticias()