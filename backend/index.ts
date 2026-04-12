import app from "./src/app";
import connectDB from "./src/config/database";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    console.log("✅ Connected to MongoDB");    
    app.listen(PORT, () => {
        console.log(`✅ Server is up and listening on port ${PORT}`);
    });
});
