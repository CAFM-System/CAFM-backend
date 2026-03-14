import express from "express";
import {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
  deleteUser,
} from "../../controllers/adminUser.controller.js";
import authenticate from "../../middlewares/auth.js";
import checkRole from "../../middlewares/roleCheck.js";

const adminUserRouter = express.Router();

adminUserRouter.post("/", authenticate, checkRole("admin"), createUser);
adminUserRouter.get("/", authenticate, checkRole("admin"), getUsers);
adminUserRouter.put("/:id", authenticate, checkRole("admin"), updateUser);
adminUserRouter.patch("/:id/status", authenticate, checkRole("admin"), updateUserStatus);
adminUserRouter.delete("/:id", authenticate, checkRole("admin"), deleteUser);

export default adminUserRouter;
