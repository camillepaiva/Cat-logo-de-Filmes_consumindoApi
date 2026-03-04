import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/MoviesView.vue"),
    meta: {
      title: "Catalogo de Filmes",
    },
  },
  {
    path: "/filmes/:id",
    name: "movie-details",
    component: () => import("@/views/MovieDetailsView.vue"),
    props: true,
    meta: {
      title: "Detalhes do Filme",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
    meta: {
      title: "Pagina nao encontrada",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} | Catalogo`
    : "Catalogo de Filmes";

  next();
});

export default router;
