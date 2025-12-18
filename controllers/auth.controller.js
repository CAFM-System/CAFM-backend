import { loginUser, getUserRole } from "../models/auth.model.js";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const { user, session } = await loginUser(email, password);

    console.log("LOGIN EMAIL:", email);
    console.log("AUTH USER ID:", user.id);

    
    const role = await getUserRole(user.id);

    return res.status(200).json({
      message: "Login successful",
      accessToken: session.access_token,
      expiresIn: session.expires_in,
      user: {
        id: user.id,
        email: user.email,
        role
      }
    });

  } catch (err) {
    console.error(err.message);

    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (err.message === "ROLE_NOT_FOUND") {
      return res.status(403).json({
        message: "User role not found"
      });
    }

    return res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
};

export { login };
