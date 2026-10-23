import express from "express";
import cors from "cors";
import connectDB from "./db/connection.js";
import authRoutes from "./Routes/auth.js";
import categoryRoutes from "./Routes/categoryRoutes.js";
import supplierRoutes from "./Routes/supplierRoutes.js";
import productRoutes from "./Routes/productRoutes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/product', productRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});
