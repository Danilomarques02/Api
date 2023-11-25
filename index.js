const express = require('express');
const axios = require('axios');
const cors = require('cors');
const firebase = require('./firebase.js');
const app = express();

// Habilita o uso do CORS para permitir requisições de diferentes origens
app.use(cors());

// Habilita o parsing de JSON e URL-encoded nos corpos das requisições
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @api {get} /posts Obtém todas as postagens
 * @apiName GetPosts
 * @apiGroup Posts
 *
 * @apiSuccess {Object[]} posts Lista de postagens.
 * @apiSuccess {String} posts.id ID da postagem.
 * @apiSuccess {String} posts.title Título da postagem.
 * @apiSuccess {String} posts.content Conteúdo da postagem.
 */
app.get("/posts", async (req, res) => {
    try {
        const posts = await firebase.firestore.collection('posts').get();
        const listaDePosts = posts.docs;
        const resposta = listaDePosts.map(item => ({ id: item.id, ...item.data() }));

        res.send(resposta);
    } catch (error) {
        console.error("Erro ao obter posts:", error);
        res.status(500).send("Erro ao obter posts.");
    }
});

/**
 * @api {post} /posts Cria uma nova postagem
 * @apiName CreatePost
 * @apiGroup Posts
 *
 * @apiParam {String} title Título da postagem.
 * @apiParam {String} content Conteúdo da postagem.
 *
 * @apiSuccess {String} message Mensagem de confirmação.
 */
app.post("/posts", async (req, res) => {
    try {
        const post = req.body;
        console.log("Dados do post recebidos:", post);

        const doc = await firebase.firestore.collection('posts').add(post);
        console.log("ID do post criado:", doc.id);

        res.send("Post criado com o id " + doc.id);
    } catch (error) {
        console.error("Erro ao criar post:", error);
        res.status(500).send("Erro ao criar post.");
    }
});

/**
 * @api {delete} /posts/:id Deleta uma postagem
 * @apiName DeletePost
 * @apiGroup Posts
 *
 * @apiParam {String} id ID da postagem a ser deletada.
 *
 * @apiSuccess {String} message Mensagem de confirmação.
 */
app.delete("/posts/:id", async (req, res) => {
    const id = req.params.id;
    await firebase.firestore.collection('posts').doc(id).delete();
    res.send("Post apagado com sucesso");
});

/**
 * @api {get} /motive Obtém uma afirmação motivacional de uma API externa
 * @apiName GetMotivationalStatement
 * @apiGroup Motivacional
 *
 * @apiSuccess {String} statement Afirmação motivacional.
 */
app.get("/motive", async (req, res) => {
    try {
        const respostaDaRequisicao = await axios.get("https://affirmations.dev/");
        res.send(respostaDaRequisicao.data);
    } catch (error) {
        console.error("Erro ao obter dados da API:", error);
        res.status(500).send("Erro ao obter dados da API.");
    }
});

/**
 * @api {put} /posts/:id Atualiza uma postagem existente
 * @apiName UpdatePost
 * @apiGroup Posts
 *
 * @apiParam {String} id ID da postagem a ser atualizada.
 * @apiParam {String} title Novo título da postagem.
 * @apiParam {String} content Novo conteúdo da postagem.
 *
 * @apiSuccess (204) {Empty} - Sucesso sem corpo de resposta.
 */
app.put("/posts/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const novosDados = req.body;

        await firebase.firestore.collection('posts').doc(id).set(novosDados);

        res.status(204).send();
    } catch (error) {
        console.error("Erro ao atualizar post:", error);
        res.status(500).send("Erro ao atualizar post.");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`O servidor express está rodando na porta ${PORT}`);
});
