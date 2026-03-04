# Catalogo de Filmes (Vue 3 + TMDB)

Projeto refatorado com foco em arquitetura limpa, componentizacao e integracao com API real.

## Stack
- Vue 3 (Composition API)
- Vue Router 4
- Vue CLI 5
- TMDB API v3 (autenticacao com token v4 read access)

## Configuracao
1. Copie `.env.example` para `.env.local`.
2. Gere seu token em https://www.themoviedb.org/settings/api.
3. Preencha `VUE_APP_TMDB_API_READ_TOKEN` (ou `VUE_APP_TMDB_API_KEY`) em `.env.local`.

Exemplo:
```env
VUE_APP_TMDB_API_READ_TOKEN=seu_token_tmdb
VUE_APP_TMDB_API_KEY=sua_chave_tmdb_opcional
VUE_APP_TMDB_LANGUAGE=pt-BR
VUE_APP_TMDB_REGION=BR
VUE_APP_TMDB_DISCOVER_PAGES=3
```

## Scripts
```bash
npm install
npm run serve
npm run lint
npm run build
```

## Estrutura do projeto
```text
src/
  assets/styles/         # tema global e design tokens
  components/            # componentes reutilizaveis de UI
  components/base/       # blocos base (loader/empty state)
  composables/           # estado compartilhado e regras de negocio
  constants/             # dicionarios e enums simples
  services/              # acesso a API TMDB e normalizacao de dados
  utils/                 # funcoes puras (data, youtube)
  views/                 # paginas (lista, detalhes, 404)
  router.js              # configuracao de rotas
```

## O que a integracao com TMDB faz
- Lista de filmes via `/discover/movie` com cache local em memoria.
- Detalhes por filme via `/movie/{id}`.
- Trailer oficial por `append_to_response=videos` e selecao automatica do melhor video YouTube.
- Normalizacao de dados para formato unico no frontend.
- Tratamento de erro com mensagens amigaveis.

## Observacoes
- Este projeto usa TMDB, mas nao e endossado ou certificado pelo TMDB.
- Favoritos continuam locais, salvos em `localStorage`.
- Se as credenciais TMDB nao estiverem configuradas no ambiente, o app usa fallback automatico para `public/movies.json`.

## Deploy na Vercel
Para usar TMDB em producao, configure variaveis no painel da Vercel:
1. Projeto na Vercel -> `Settings` -> `Environment Variables`.
2. Adicione:
   - `VUE_APP_TMDB_API_READ_TOKEN` (ou `VUE_APP_TMDB_API_KEY`)
   - `VUE_APP_TMDB_LANGUAGE`
   - `VUE_APP_TMDB_REGION`
   - `VUE_APP_TMDB_DISCOVER_PAGES`
3. Clique em `Redeploy` para rebuild com as envs novas.
