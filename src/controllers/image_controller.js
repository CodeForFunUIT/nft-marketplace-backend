import Image from "../models/image.js";
import mongoose from "mongoose";

export const getImage = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: `No Image with id: ${id}` });
    try {
        const image = await Image.findById(id);
        if (!image) {
            throw new Error(`Image ${req.params.id} not found`)
        }
        res.set("Content-Type", "image/png");
        res.send(image.data);
    } catch (e) {
        console.log(error);
        res.status(404).send(e);
    }
}