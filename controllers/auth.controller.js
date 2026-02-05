import { loginUser, getUserRole, getUserProfile, logoutUser, sendPasswordResetEmail, signUpUser } from "../models/auth.model.js";
import { createClient } from '@supabase/supabase-js';

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
          createdAt: profile.created_at,
          apartmentNo: profile.residents?.apartment_no ?? null,
          building: profile.residents?.building ?? null,
          dateOfEntry: profile.residents?.date_of_entry ?? null,
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
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    await logoutUser(token);

    console.log("LOGOUT USER EMAIL:", req.user.email);

    return res.status(200).json({
      success: true,
      message: "Logout successful"
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

// Forgot Password controller
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    console.log("FORGOT PASSWORD EMAIL:", email);

    await sendPasswordResetEmail(email);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully"
    });

  } catch (err) {
    console.error(err.message);

    if (err.message === "EMAIL_SEND_FAILED") {
      return res.status(400).json({
        message: "Failed to send reset email"
      });
    }

    return res.status(500).json({
      message: "An error occurred",
      error: err.message
    });
  }
};

// Reset Password controller
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // Create a temporary Supabase client with the anon key
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Set the session using the recovery token
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    });

    if (sessionError) {
      console.error("Session error:", sessionError);
      return res.status(400).json({
        message: "Invalid or expired reset link"
      });
    }

    // Now update the password
    const { data, error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error("Reset password error:", error);
      return res.status(400).json({
        message: "Failed to reset password"
      });
    }

    console.log("PASSWORD RESET FOR USER:", data.user.email);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: "An error occurred",
      error: err.message
    });
  }
};

//signupUser

const registerUser =async (req, res) => {
  try {
    const { email, password, first_name,last_name,apartment_no,phone } = req.body;

    if(!email || !password || !first_name || !last_name || !apartment_no || !phone){
      return res.status(400).json({message : "Missing required fields"})
    }

    const user = await signUpUser(email,password,first_name,last_name,apartment_no,phone);
    return res.status(201).json({message : "User register successfully", user});

  }catch (error) {
    console.error("Register error" , error.message);

    if (error.message === "USER_EXISTS"){
      return res.status(409).json({ message : "User alresdy exists"});
    }

    return res.status(500).json ({

      message : "Register Failed",
      error : error.message
    });
  }
}


export { login, getMe, logout, forgotPassword, resetPassword, registerUser };