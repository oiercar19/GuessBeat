import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (userExists) {
      return res.status(400).json({ message: "El usuario o email ya existen" });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      avatarIndex: 0,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarIndex: user.avatarIndex,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarIndex: user.avatarIndex,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) res.json(user);
  else res.status(404).json({ message: "Usuario no encontrado" });
};

export const getRanking = async (req, res) => {
  try {
    const users = await User.find({}, "username stats avatarIndex")
      .sort({ stats: -1 })
      .limit(20); // top 20 jugadores

    res.json(users);
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    res.status(500).json({ message: "Error al obtener ranking" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const { username, email, password, avatarIndex } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    if (avatarIndex !== undefined && avatarIndex !== user.avatarIndex) {
      const cost = 500;
      if (user.stats >= cost) {
        user.avatarIndex = avatarIndex;
        user.stats -= cost;
      } else {
        return res.status(400).json({ message: "No tienes suficientes puntos para comprar este avatar" });
      }
    }

    const updatedUser = await user.save();
    res.json({
      message: "Perfil actualizado correctamente",
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        avatarIndex: updatedUser.avatarIndex,
        stats: updatedUser.stats,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
};

export const updateStats = async (req, res) => {
  const { username, points } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Asegurar que la puntuación nunca sea negativa
    user.stats = Math.max(0, (user.stats || 0) + points);
    await user.save();

    res.json({ message: "Puntos actualizados", newStats: user.stats });
  } catch (error) {
    console.error("Error al actualizar stats:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
