import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true, unique: true, trim: true },
    categoryDescription: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
