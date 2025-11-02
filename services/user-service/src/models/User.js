import mongoose from "mongoose";

const socialLoginSchema = new mongoose.Schema({
  provider: { type: String },
  providerId: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { 
      type: String, 
      required: function() {
        // Password solo requerido si NO hay login social
        return !(Array.isArray(this.social_login) && this.social_login.length > 0);
      }
    },
    stats: { type: Number, default: 0 },
    social_login: [socialLoginSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);