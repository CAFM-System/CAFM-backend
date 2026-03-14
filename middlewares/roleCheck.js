const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: "No role found on user" });
    }

    const userRole = req.user.role.toLowerCase();
    if (!allowedRoles.some((r) => r.toLowerCase() === userRole)) {
      return res.status(403).json({
        message: "Insufficient permissions",
        userRole: req.user.role,
        required: allowedRoles,
      });
    }

    next();
  };
};

export default checkRole;
