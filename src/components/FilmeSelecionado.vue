<template>
  <div>
    <div v-if="loadingTrailer">
      <div class="loader"></div>
    </div>
    <div v-if="filme && !loadingTrailer">
      <iframe
        :src="formatarUrlYoutube(filme.trailer)"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="trailer"
        @load="loadingTrailer = false"
      ></iframe>
      <div class="filme_container">
        <img :src="filme.picture" class="img_capa" />
        <div class="informacoes">
          <h2>{{ filme.title }}</h2>
          <p>Categoria: {{ formatarCategoria(filme.category) }}</p>
          <p>{{ filme.description }}</p>
          <p>Avaliação: {{ filme.rating }}/10</p>
          <p>Data de Lançamento: {{ converterParaData(filme.release_date) }}</p>
        </div>
      </div>
    </div>
    <p v-else>Carregando...</p>
  </div>
</template>

<script>
import ApiFilmes from "../service/ApiFilmes";

export default {
  name: "FilmeSelecionado",
  computed: {
    id() {
      return this.$route.params.id;
    },
  },
  data() {
    return {
      filme: null,
      loadingTrailer: true,
    };
  },
  async created() {
    await this.fetchFilme();
  },
  methods: {
    async fetchFilme() {
      try {
        const response = await ApiFilmes.getMovieById(this.id);
        this.filme = response.data;
        this.loadingTrailer = false;
        console.log(response.data);
      } catch (error) {
        this.loadingTrailer = false;

        console.error("Erro ao buscar filme:", error);
      }
    },
    converterParaData(dataMillis) {
      const date = new Date(dataMillis);
      return date.toLocaleDateString();
    },

    formatarCategoria(categoria) {
      switch (categoria) {
        case "DRAMA":
          return "Drama";
        case "SUSPENSE":
          return "Suspense";
        case "DOCUMENTARIO":
          return "Documentário";
        case "TERROR":
          return "Terror";
        case "FICCAO_CIENTIFICA":
          return "Ficção Científica";
        default:
          return categoria;
      }
    },
    formatarUrlYoutube(url) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    },
  },
};
</script>

<style>
.loader {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-top: 150px;
  margin-left: 48%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.trailer {
  width: 100%;
  height: 380px;
  border: none; /* Remove a borda do iframe */
  object-fit: cover; /* Preenche o espaço mantendo a proporção */
}

.filme_container {
  padding-top: 30px;
  display: flex;
  flex-direction: row;
  column-gap: 50px;
  margin-left: 10%;
}

.img_capa {
  width: 200px;
  height: 300px;
}
.informacoes {
  color: white;
  font-family: "Montserrat", sans-serif;
  border-radius: 20px;
  border: 1px solid red;
  padding: 3%;
}

h2 {
  color: red;
}
</style>
