import { httpServer } from './server';
import mongo from './database/mongo';
import { Config } from './config/config';

async function init() {
    try {
        await mongo.connect();
        console.log('✅ MongoDB connected');

        httpServer.listen(Config.port, () => {
            console.log(`🚀 Chat Service running on http://localhost:${Config.port}`);
            console.log(`🌐 WebSocket server ready`);
            console.log(`📚 API docs available at http://localhost:${Config.port}/api-docs`);
        });
    } catch (error) {
        console.error('Failed to start Chat Service:', error);
        process.exit(1);
    }
}

init();
export default httpServer;
