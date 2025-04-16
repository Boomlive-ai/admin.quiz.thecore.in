import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/AdminView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// // Navigation guard
// router.beforeEach(async (to, from, next) => {
//   // Check if the route requires authentication
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     const authStore = useAuthStore()

//     // If we haven't checked auth status yet, do it now
//     if (!authStore.loading && !authStore.isAuthenticated) {
//       await authStore.checkAuth()
//     }

//     // If still not authenticated after checking, redirect to home with a query param
//     if (!authStore.isAuthenticated) {
//       next({
//         path: '/',
//         query: { requiresAuth: true }
//       })
//     } else {
//       next()
//     }
//   } else {
//     next()
//   }
// })


router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Check auth status once
  if (!authStore.checkedAuth) {
    await authStore.checkAuth();
  }

  const isAuthed = authStore.isAuthenticated;

  // Allow all access to "about"
  if (to.path === "/about") return next();

  // Allow everything if authenticated
  if (isAuthed) return next();

  // If not authenticated and route requiresAuth → prevent access and trigger popup
  if (to.meta.requiresAuth && !isAuthed) {
    return next({
      path: "/about",
      query: { requiresAuth: "true" },
    });
  }

  // Default fallback
  return next();
});

export default router;
