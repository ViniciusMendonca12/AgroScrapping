var axios = require('axios');
var cheerio = require('cheerio');
const FormData = require('form-data');

var Noticias = require("../models/NoticiasModel")
var ControleImagens = require("../models/ControleImagensModel")


const url = 'https://www.noticiasagricolas.com.br/noticias/';

async function pegarNoticias() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let noticias = [];

        $('.horizontal').each((index, element) => {
            const titulo = $(element).find('div h2').text().trim();
            const link = $(element).find('a').attr('href');

            noticias.push({
                titulo,
                link: `https://www.noticiasagricolas.com.br${link}`,

            });
        });

        for (let noticia of noticias) {
            await pegarDetalhesNoticias(noticia);
        }

        return noticias
    } catch (error) {
        console.error('Erro ao capturar as notícias:', error);
    }
}

async function pegarDetalhesNoticias(noticia) {
    try {
        const { data } = await axios.get(noticia.link);
        const $ = cheerio.load(data);

        var conteudoTexto = ""

        $('p').each((index, element) => {
            const paragrafo = $(element).text().trim();

            if (!paragrafo.toLowerCase().includes("newsletter") &&
                !paragrafo.toLowerCase().includes("cadastre-se") &&
                !paragrafo.toLowerCase().includes("termo de privacidade") &&
                paragrafo.length > 0) {
                conteudoTexto += paragrafo + '\n\n';
            }

        });

        const fonte = removerFontePrefixo($('.fonte').text().trim())
        const dataPublicacao = removerDataPrefixo($('.datas').text().trim())
        const conteudoTextoResumido = await summarizeText(conteudoTexto, 10);

        noticia.conteudoTexto = conteudoTextoResumido;
        noticia.fonte = fonte || 'Fonte não encontrada';
        noticia.dataPublicacao = dataPublicacao || 'Data de publicação não encontrada';

    } catch (error) {
        console.error(`Erro ao capturar detalhes da notícia: ${noticia.link}`, error);
    }
}
async function summarizeText(text, sentences) {
    const formdata = new FormData();
    formdata.append("key", "d6c55268715ac45a3ef08a508e43cd74");  
    formdata.append("txt", text);  
    formdata.append("sentences", sentences);  

    try {
        const response = await axios.post("https://api.meaningcloud.com/summarization-1.0", formdata, {
            headers: formdata.getHeaders()
        });

        if (response.status === 200) {
            return response.data.summary;  
        } else {
            console.log("Erro:", response.status);
            return null;
        }
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

function removerFontePrefixo(fonte) {
    const prefixo = "Fonte:";

    if (fonte.startsWith(prefixo)) {
        return fonte.replace(prefixo, '').trim();
    }
    return fonte.trim();
}


function removerDataPrefixo(data) {
    const prefixo = "Publicado em";

    if (data.startsWith(prefixo)) {
        return data.replace(prefixo, '').trim();
    }
    return data.trim();
}

async function vinculaImagemNoticia(noticiasNovas) {
    var ControleImagensInformacoes = await ControleImagens.informacoesPaginaIndice()
    var paginaAPI = ControleImagensInformacoes.pagina
    var index = ControleImagensInformacoes.indice

    for (const noticia of noticiasNovas) {
        try {
            if (index >= 20) {
                paginaAPI++
                index = 0
            }
            const imagens = await axios.get(`https://pixabay.com/api/?key=46471805-03f1774d4fd3f2c7f698604d3&q=agriculture&image_type=photo&page=${paginaAPI}`);
            var imagem = imagens.data.hits[index].webformatURL
            noticia.imagem = imagem
            index++;

        } catch (error) {
            console.error("Erro ao buscar imagem:", error);
        }
    }

    ControleImagens.salvaInformacoesPaginaIndice({ pagina: paginaAPI, indice: index })

    return noticiasNovas
}

async function salvaNoticias(req, res) {
    try {

        const noticiasNovas = await pegarNoticias()
        const pegaNoticiasBanco = await Noticias.pegaNoticiasBanco()
        const titulosBanco = new Set(pegaNoticiasBanco.map(noticia => noticia.titulo));
        const noticiasParaComparar = []

        noticiasNovas.forEach(function (noticia, index) {
            if (!titulosBanco.has(noticia.titulo)) {
                noticiasParaComparar.push(noticia)
            }
        })

        var noticiasNovasComImagem = await vinculaImagemNoticia(noticiasParaComparar)

        const salvaNoticiasBanco = await Noticias.salvaNoticiasBanco(noticiasNovasComImagem)

        if (salvaNoticiasBanco.status) {
            console.log("Noticias salvas com sucesso")
        } else {
            console.log("Houve um erro ao salvar as noticias")
        }

        return { status: true }
    } catch (error) {
        console.log(error)
    }
}




module.exports = {
    salvaNoticias
};