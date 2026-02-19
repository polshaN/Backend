import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['src/test/**/*.test.ts'], // <-- ensures controller & service tests
        globals: true, // optional, for describe/it without imports
        environment: 'node', // since backend
    },
});
