import mongoose from "mongoose";
import { Schema } from "mongoose";

const socialLoginSchema = new Schema({
  provider: { type: String },
  providerId: { type: String },
});

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: function () {
        //Solo pedimos email si el usuario NO viene de un login social
        return !(Array.isArray(this.social_login) && this.social_login.length > 0);
      },
      unique: true,
      sparse: true, //evita conflictos de índice único si hay usuarios sin email
    },
    password: {
      type: String,
      required: function () {
        return !(Array.isArray(this.social_login) && this.social_login.length > 0);
      }
    },
    stats: { type: Number, default: 0 },
    avatarIndex: { type: Number, default: null },
    social_login: [socialLoginSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
