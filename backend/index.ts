import app from "./src/app";
import connectDB from "./src/config/database";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();
        console.log("✅ Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`✅ Server is up and listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error starting server", error);
        process.exit(1);
    }
};

startServer();
