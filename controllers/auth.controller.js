import { loginUser, getUserRole, getUserProfile, logoutUser } from "../models/auth.model.js";

// Login controller
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

// Get current user details
const getMe = async (req, res) => {
  try {
    // req.user is set by authenticate middleware
    const userId = req.user.id;

    console.log("GET ME REQ USER:", req.user);

    const profile = await getUserProfile(userId);

    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        profile: {
          firstName: profile.first_name,
          lastName: profile.last_name,
          phone: profile.phone,
          createdAt: profile.created_at
        }
      }
    });

  } catch (err) {
    console.error(err.message);

    if (err.message === "PROFILE_NOT_FOUND") {
      return res.status(404).json({
        message: "User profile not found"
      });
    }

    return res.status(500).json({
      message: "Failed to get user details",
      error: err.message
    });
  }
};

// Logout controller - invalidates user session
const  logout = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    // Invalidate the session
    await logoutUser(token);

    console.log("LOGOUT USER EMAIL:", req.user.email);
   

    return res.status(200).json({
      success: true,
      message: "Logout successful",
      
    });


  } catch (err) {
    console.error(err.message);

    if (err.message === "LOGOUT_FAILED") {
      return res.status(500).json({
        message: "Logout failed"
      });
    }

    return res.status(500).json({
      message: "An error occurred during logout",
      error: err.message
    });
  }
};

export { login, getMe, logout };