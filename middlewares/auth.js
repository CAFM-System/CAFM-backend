import { supabaseAdmin } from "../config/supabaseClient.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return res.sendStatus(401);

    const user = data.user;

    // Query profile – try with is_active, fall back without it
    let roleData = null;
    let roleError = null;

    const { data: d1, error: e1 } = await supabaseAdmin
      .from("profiles")
      .select("role,first_name,last_name,is_active")
      .eq("user_id", user.id)
      .single();

    if (e1) {
      // Possibly is_active column doesn't exist yet – retry without it
      const { data: d2, error: e2 } = await supabaseAdmin
        .from("profiles")
        .select("role,first_name,last_name")
        .eq("user_id", user.id)
        .single();
      roleData = d2;
      roleError = e2;
    } else {
      roleData = d1;
      roleError = e1;
    }

    if (roleError || !roleData) {
      console.error("Auth middleware - profile fetch failed:", roleError);
      return res.status(403).json({ message: "Profile not found", debug: roleError?.message });
    }

    // Check deactivation: profiles column first, then auth user_metadata fallback
    const isActive = roleData.is_active !== undefined
      ? roleData.is_active
      : user.user_metadata?.is_active;

    if (isActive === false) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: roleData.role?.toLowerCase(),
      name: `${roleData.first_name} ${roleData.last_name}`,
    };

    console.log("Auth middleware - user authenticated:", req.user.email, "role:", req.user.role);
    next();
  } catch (err) {
    console.error("Auth middleware - exception:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};

export default authenticate;
