import { getMovieById as getMovieByIdFromService } from "@/services/moviesService";

const ApiFilmes = {
  async getMovieById(id) {
    const movie = await getMovieByIdFromService(id);
    return { data: movie };
  },
};

export default ApiFilmes;
