// api-gateway/src/server.ts
import app from './app';
import { Config } from './config/config';

const PORT = Config.port || 4000;

app.listen(PORT, () => {
    console.log(`\n🚀 API Gateway started successfully!`);
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`📄 OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
});
