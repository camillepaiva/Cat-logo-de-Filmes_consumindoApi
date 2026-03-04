# Catalogo de Filmes (Vue 3 + TMDB)

Projeto refatorado com foco em arquitetura limpa, componentizacao e integracao com API real da TMDB com proxy serverless na Vercel.

## Stack
- Vue 3 (Composition API)
- Vue Router 4
- Vue CLI 5
- TMDB API (via proxy serverless em `api/tmdb`)

## Configuracao local
1. Copie `.env.example` para `.env.local`.
2. Para rodar apenas com fallback local (`public/movies.json`), nao precisa de credenciais.
3. Para usar TMDB localmente com `npm run serve`, preencha `VUE_APP_TMDB_API_READ_TOKEN` ou `VUE_APP_TMDB_API_KEY`.

Exemplo local:
```env
VUE_APP_TMDB_PROXY_BASE=/api/tmdb
VUE_APP_TMDB_LANGUAGE=pt-BR
VUE_APP_TMDB_REGION=BR
VUE_APP_TMDB_DISCOVER_PAGES=3
VUE_APP_TMDB_API_KEY=sua_chave_tmdb_opcional
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
api/
  tmdb/[...path].js      # proxy serverless para TMDB (Vercel)
src/
  assets/styles/         # tema global e design tokens
  components/            # componentes reutilizaveis de UI
  components/base/       # blocos base (loader/empty state)
  composables/           # estado compartilhado e regras de negocio
  constants/             # dicionarios e enums simples
  services/              # acesso ao proxy TMDB e normalizacao de dados
  utils/                 # funcoes puras (data, youtube)
  views/                 # paginas (lista, detalhes, 404)
  router.js              # configuracao de rotas
```

## Integracao TMDB
- Lista de filmes via `/discover/movie`.
- Detalhes por filme via `/movie/{id}` com `append_to_response`.
- Trailer oficial (YouTube), elenco, classificacao, provedores e dados tecnicos.
- Fallback automatico para `public/movies.json` se API/proxy estiver indisponivel.

## Deploy na Vercel (recomendado)
Configure variaveis **no backend da Vercel** (sem prefixo `VUE_APP_`):
1. Projeto na Vercel -> `Settings` -> `Environment Variables`.
2. Adicione:
   - `TMDB_API_READ_TOKEN` (ou `TMDB_API_KEY`)
   - `VUE_APP_TMDB_PROXY_BASE=/api/tmdb`
   - `VUE_APP_TMDB_LANGUAGE=pt-BR`
   - `VUE_APP_TMDB_REGION=BR`
   - `VUE_APP_TMDB_DISCOVER_PAGES=3`
3. Clique em `Redeploy`.

## Observacoes
- Este projeto usa TMDB, mas nao e endossado ou certificado pelo TMDB.
- Favoritos continuam locais, salvos em `localStorage`.
- Nunca commite credenciais reais em arquivos versionados.
