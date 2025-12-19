import { supabaseAdmin } from "../config/supabaseClient.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return res.sendStatus(401);

    const user = data.user;

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !roleData) return res.sendStatus(403);

    req.user = {
      id: user.id,
      email: user.email,
      role: roleData.role
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

export default authenticate;
