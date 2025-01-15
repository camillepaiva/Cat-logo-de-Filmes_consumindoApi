<template>
  <div class="header">
    <h1>Catálogo de filmes</h1>
  </div>

  <div class="pagina_container">
    <div v-for="obj in listFilmes" :key="obj.id" class="cards_filmes_container">
      <h2>{{ obj.title }}</h2>
      <div class="img_container">
        <RouterLink :to="{ name: 'descricaoFilme', params: { id: obj.id } }">
          <img :src="obj.picture" class="img_capa" />
        </RouterLink>
        <img
          v-if="!obj.favorito"
          src="../assets/favoritoSimples.png"
          class="img_sobreposta"
          @click="alternarFavorito(obj.id)"
        />
        <img
          v-if="obj.favorito"
          src="../assets/favoritoClicado.png"
          class="img_sobreposta"
          @click="alternarFavorito(obj.id)"
        />
      </div>
      <div class="info">
        <p>Avaliação: {{ obj.rating }}/10</p>
        <p>Data de Lançamento: {{ converterParaData(obj.release_date) }}</p>
        <p>{{ obj.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import ApiFilmes from "../service/ApiFilmes";

export default {
  name: "filmesComponente",

  data() {
    return {
      listFilmes: [],
    };
  },

  methods: {
    converterParaData(dataMillis) {
      const date = new Date(dataMillis);
      return date.toLocaleDateString();
    },

    alternarFavorito(id) {
      const filme = this.listFilmes.find((obj) => obj.id === id);
      if (filme) {
        filme.favorito = !filme.favorito;
      }
    },
  },

  async created() {
    try {
      const response = await ApiFilmes.getMovies();
      const lista = response.data.map((filme) => ({
        ...filme,
        favorito: false,
      }));
      this.listFilmes = lista;
      console.log(lista);
    } catch (error) {
      console.error("Erro ao buscar filmes:", error);
    }
  },
};
</script>

<style scoped>
.header {
  text-align: center;
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: center;
  margin-bottom: 50px;
  background-color: rgb(0, 0, 0);
  color: red;
  position: fixed;
  z-index: 2;
}

.pagina_container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
  width: 80%;
  margin-left: 10%;
  margin-right: 10%;
  padding-top: 150px;
  position: relative;
}

.cards_filmes_container {
  display: flex;
  flex-direction: column;
  width: 300px;
}
h2 {
  color: rgb(245, 217, 217);
  font-family: "Montserrat", sans-serif;
}
p {
  color: #fff;
  margin: 7px;
}

/* Ajusta o posicionamento e o z-index da imagem sobreposta */
.img_container {
  position: relative;
}

.img_capa {
  width: 250px;
  height: 350px;
  border: 2px solid red;
  border-radius: 10px;
}

.img_sobreposta {
  position: absolute;
  top: 309px;
  left: 197px;
  width: 25px;
  height: 25px;
  z-index: 1;
  cursor: pointer;
}

.info {
  margin: 3px;
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
  font-size: small;
}
</style>
