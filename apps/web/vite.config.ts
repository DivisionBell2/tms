import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	server: {
		port: 5173,
		proxy: {
			// Проксируем только /api/ping (демо-страница). Остальные /api/* обслуживает SvelteKit
			// (src/routes/api/**), иначе cookie с токенами не выставляются.
			'^/api/ping$': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts'],
		setupFiles: ['./src/vitest-setup.ts']
	}
});
