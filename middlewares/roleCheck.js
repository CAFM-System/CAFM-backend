const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) return res.sendStatus(403);

    if (!allowedRoles.includes(req.user.role)) {
      return res.sendStatus(403);
    }

    next();
  };
};

export default checkRole;
