var knex = require("../database/database")

class ControleImagens {

    async informacoesPaginaIndice() {
        try {
            var informacoes = await knex.select("controle_imagens.*").table("controle_imagens").first()
            return informacoes
        } catch (error) {
            console.log("Erro ao pegar as informaçoes de controle da imagem")
            return []

        }
    }

    async salvaInformacoesPaginaIndice(informacoes){
        try {
            await knex('controle_imagens')
                .where({ id: 1 })  
                .update(informacoes);  
    
            console.log('Informações do controle de imagem atualizadas com sucesso.');
        } catch (error) {
            console.error('Erro ao atualizar as informações:', error);
        }
    }


}

module.exports = new ControleImagens()