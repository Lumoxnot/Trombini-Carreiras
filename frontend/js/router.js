import { APP_STATE } from './config.js';
import { AuthService } from './auth.js';

export const Router = {
    routes: {},
    currentRoute: null,

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                this.navigateTo(link.getAttribute('href'));
            }
        });
        this.handleRoute();
    },

    register(path, handler) {
        this.routes[path] = handler;
    },

    navigateTo(path) {
        history.pushState(null, null, path);
        this.handleRoute();
    },

    async handleRoute() {
        const path = window.location.pathname;
        this.currentRoute = path;

        // Rotas públicas
        if (path === '/' || path === '/index.html') {
            await this.routes['/']();
            return;
        }

        if (path === '/auth/callback') {
            await this.routes['/auth/callback']();
            return;
        }
        
        if (path === '/login') {
            await this.routes['/login']();
            return;
        }

        if (path === '/register') {
            await this.routes['/register']();
            return;
        }

        // Verificar autenticação para rotas protegidas
        const isAuth = await AuthService.checkAuth();
        
        if (!isAuth && path !== '/') {
            this.navigateTo('/');
            return;
        }

        // Se autenticado mas sem perfil, redirecionar para setup
        if (isAuth && !APP_STATE.userProfile && path !== '/setup-profile') {
            this.navigateTo('/setup-profile');
            return;
        }

        const handler = this.routes[path];
        if (handler) {
            await handler();
        } else {
            this.navigateTo('/');
        }
    }
};
