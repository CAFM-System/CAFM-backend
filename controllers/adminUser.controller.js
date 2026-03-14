import { body, param, validationResult } from "express-validator";
import {
  createUserInAuth,
  deleteUserInAuth,
  createUserProfile,
  createResidentRecord,
  getAllUsers,
  updateUserProfile,
  setUserActiveStatus,
  deleteUserProfile,
} from "../models/adminUser.model.js";
import { generateTempPassword } from "../utils/passwordGenerator.js";
import { notifyUserById } from "../models/notification.model.js";

// Validation helper
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

// Validation rules
const createUserValidation = [
  body("first_name").trim().notEmpty().withMessage("First name is required"),
  body("last_name").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("nic_passport").trim().notEmpty().withMessage("NIC/Passport is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("role")
    .isIn(["admin", "technician", "resident"])
    .withMessage("Role must be admin, technician, or resident"),
  body("apartment_no")
    .if(body("role").equals("resident"))
    .trim()
    .notEmpty()
    .withMessage("Apartment number is required for resident users"),
];

const updateUserValidation = [
  param("id").isUUID().withMessage("Valid user ID is required"),
  body("first_name").optional().trim().notEmpty().withMessage("First name cannot be empty"),
  body("last_name").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  body("role")
    .optional()
    .isIn(["admin", "technician", "resident"])
    .withMessage("Role must be admin, technician, or resident"),
  body("email").not().exists().withMessage("Email cannot be updated"),
  body("nic_passport").not().exists().withMessage("NIC/Passport cannot be updated"),
];

const updateStatusValidation = [
  param("id").isUUID().withMessage("Valid user ID is required"),
  body("is_active").isBoolean().withMessage("is_active must be a boolean"),
];

// POST /api/admin/users — Create a new user
const createUser = [
  ...createUserValidation,
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    let userId = null;

    try {
      const { first_name, last_name, email, nic_passport, phone, role, apartment_no } = req.body;

      // Generate temporary password
      const tempPassword = generateTempPassword();

      // Create user in Supabase Auth
      const authData = await createUserInAuth(email, tempPassword);
      userId = authData.user.id;

      // Create profile
      await createUserProfile(userId, {
        first_name,
        last_name,
        email,
        nic_passport,
        phone,
        role,
      });

      // If resident, create resident record (non-blocking after user/profile success)
      let warning = null;
      if (role === "resident") {
        try {
          await createResidentRecord(userId, apartment_no);
        } catch (residentError) {
          console.error("Create resident record error:", residentError.message);
          warning = "User created successfully, but resident record creation failed";
        }
      }

      notifyUserById(
            userId,
            "Welcome to CAFM! Your account has been created.",
            `Your temporary password is: ${tempPassword}. Please log in and change it immediately.`, 
            `Your temporary password is: ${tempPassword}. Please log in and change it immediately.`
        ).catch(console.error);

      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: userId,
          first_name,
          last_name,
          email,
          nic_passport,
          phone,
          role,
          apartment_no: role === "resident" ? apartment_no : undefined,
        },
        tempPassword,
        warning,
      });
    } catch (error) {
      console.error("Create user error:", error.message);

      if (typeof userId !== "undefined" && userId) {
        try {
          await deleteUserInAuth(userId);
        } catch (rollbackError) {
          console.error("Create user rollback error:", rollbackError.message);
        }
      }

      if (error.message === "USER_ALREADY_EXISTS") {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      return res.status(500).json({
        message: "Failed to create user",
        error: error.message,
      });
    }
  },
];

// GET /api/admin/users — Get all users with pagination, search, filter
const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, sortBy = "created_at", sortOrder = "desc" } = req.query;

    const result = await getAllUsers({
      search,
      role,
      page: parseInt(page),
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get users error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// PUT /api/admin/users/:id — Update user profile
const updateUser = [
  ...updateUserValidation,
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { id } = req.params;
      const { first_name, last_name, phone, role } = req.body;

      // Build update object with only provided fields
      const updateData = {};
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (phone !== undefined) updateData.phone = phone;
      if (role !== undefined) updateData.role = role;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      const updatedUser = await updateUserProfile(id, updateData);

      return res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update user error:", error.message);

      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(500).json({
        message: "Failed to update user",
        error: error.message,
      });
    }
  },
];

// PATCH /api/admin/users/:id/status — Activate/Deactivate user
const updateUserStatus = [
  ...updateStatusValidation,
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const updatedUser = await setUserActiveStatus(id, is_active);

      return res.status(200).json({
        message: `User ${is_active ? "activated" : "deactivated"} successfully`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update status error:", error.message);

      if (error.message.includes("column does not exist") || error.message.includes("Run the database migration")) {
        return res.status(500).json({ message: "Database schema outdated. Please run the migration to add the is_active column." });
      }

      if (error.message.includes("USER_NOT_FOUND")) {
        return res.status(404).json({ message: "User not found" });
      }

      if (error.message.includes("STATUS_UPDATE_FAILED")) {
        return res.status(500).json({ message: error.message.replace("STATUS_UPDATE_FAILED: ", "") });
      }

      return res.status(500).json({
        message: "Failed to update user status",
        error: error.message,
      });
    }
  },
];

// DELETE /api/admin/users/:id — Delete user
const deleteUser = [
  param("id").isUUID().withMessage("Valid user ID is required"),
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { id } = req.params;

      // Delete profile and dependent records from database
      await deleteUserProfile(id);

      // Delete from Supabase Auth (best-effort)
      try {
        await deleteUserInAuth(id);
      } catch (authErr) {
        console.error("Auth deletion warning:", authErr.message);
      }

      return res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error.message);

      if (error.message.includes("PROFILE_DELETE_FAILED")) {
        return res.status(404).json({ message: "User not found or already deleted" });
      }

      return res.status(500).json({
        message: "Failed to delete user",
        error: error.message,
      });
    }
  },
];

export { createUser, getUsers, updateUser, updateUserStatus, deleteUser };
