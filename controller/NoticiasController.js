var axios = require('axios');
var cheerio = require('cheerio');
var Noticias = require("../models/NoticiasModel")
var ControleImagens = require("../models/ControleImagensModel")


async function pegarDetalhesNoticiasCanalRural(noticia) {
    try {
        const { data } = await axios.get(noticia.link);
        const $ = cheerio.load(data);

        var conteudoTexto = ""

        $('p').each((index, element) => {
            const paragrafo = $(element).text().trim();

            if (!paragrafo.toLowerCase().includes("Confira na palma da mão informações quentes sobre agricultura, pecuária, economia e previsão do tempo: siga o Canal Rural no WhatsApp!") &&
                !paragrafo.toLowerCase().includes('<img width="21" height="21"') &&
                !paragrafo.toLowerCase().includes("Cadastro efetuado com sucesso.") &&
                !paragrafo.toLowerCase().includes("Newsletter") &&
                !paragrafo.toLowerCase().includes("Ocorreu um erro") &&
                paragrafo.length > 0) {
                conteudoTexto += paragrafo + '\n\n';
            }

        });
        

        const fonte = "Canal Rural"
        const dataPublicacao = $('time.text-gray-500.content-infopost span').text().trim()

        noticia.conteudoTexto = conteudoTexto 
        noticia.fonte = fonte || 'Fonte não encontrada';
        noticia.dataPublicacao = dataPublicacao || 'Data de publicação não encontrada';

/*         console.log(noticia)
 */    } catch (error) {
        console.error(`Erro ao capturar detalhes da notícia: ${noticia.link}`, error);
    }
}


const urlCanalRural = "https://www.canalrural.com.br/ultimas-noticias/"
async function pegarNoticiasCanalRural() {
    try {
        const { data } = await axios.get(urlCanalRural);
        const $ = cheerio.load(data);

        let noticiasCanalRural = [];

        $('.feed').each((index, element) => {
            if (index >= 10) return false; // Limita a 10 notícias
        
            const titulo = $(element).find('.feed-title').text().trim();
            const link = $(element).find('a').attr('href');
        
            noticiasCanalRural.push({
                titulo,
                link
            });
        });
        

        for (let noticiaCanalRural of noticiasCanalRural) {
            await pegarDetalhesNoticiasCanalRural(noticiaCanalRural);
        } 
        // console.log(noticiasCanalRural)
        return noticiasCanalRural
    } catch (error) {
        console.error('Erro ao capturar as notícias do Canal rural:', error);
    }
}


async function pegarDetalhesNoticiasCanalRural(noticia) {
    try {
        const { data } = await axios.get(noticia.link);
        const $ = cheerio.load(data);

        var conteudoTexto = ""

        $('p').each((index, element) => {
            const paragrafo = $(element).text().trim();

            if (!paragrafo.toLowerCase().includes("Confira na palma da mão informações quentes sobre agricultura, pecuária, economia e previsão do tempo: siga o Canal Rural no WhatsApp!") &&
                !paragrafo.toLowerCase().includes('<img width="21" height="21"') &&
                !paragrafo.toLowerCase().includes("Cadastro efetuado com sucesso.") &&
                !paragrafo.toLowerCase().includes("Newsletter") &&
                !paragrafo.toLowerCase().includes("Ocorreu um erro") &&
                paragrafo.length > 0) {
                conteudoTexto += paragrafo + '\n\n';
            }

        });
        

        const fonte = "Canal Rural"
        const dataPublicacao = $('time.text-gray-500.content-infopost span').text().trim()

        noticia.conteudoTexto = conteudoTexto 
        noticia.fonte = fonte || 'Fonte não encontrada';
        noticia.dataPublicacao = dataPublicacao || 'Data de publicação não encontrada';
        
    } catch (error) {
        console.error(`Erro ao capturar detalhes da notícia: ${noticia.link}`, error);
    }
}

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

        noticia.conteudoTexto = conteudoTexto 
        noticia.fonte = fonte || 'Fonte não encontrada';
        noticia.dataPublicacao = dataPublicacao || 'Data de publicação não encontrada';

    } catch (error) {
        console.error(`Erro ao capturar detalhes da notícia: ${noticia.link}`, error);
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
        let noticiasNovasCanalRural = await pegarNoticiasCanalRural()
        let noticiasNovas = await pegarNoticias()
        noticiasNovas = noticiasNovas.concat(noticiasNovasCanalRural);

        let pegaNoticiasBanco = await Noticias.pegaNoticiasBanco()
        let titulosBanco = new Set(pegaNoticiasBanco.map(noticia => noticia.titulo));
        let noticiasParaComparar = []

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