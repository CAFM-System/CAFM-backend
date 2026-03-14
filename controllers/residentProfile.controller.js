import { body, validationResult } from "express-validator";
import {
  getResidentProfile,
  updateResidentProfile,
} from "../models/residentProfile.model.js";

// Validation helper
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0]?.msg || "Validation failed",
      errors: errors.array(),
    });
  }
  return null;
};

// Validation rules for profile update
const updateProfileValidation = [
  body("first_name").optional().trim().notEmpty().withMessage("First name cannot be empty"),
  body("last_name").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  body("date_of_birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Valid date of birth is required"),
  body("gender")
    .optional({ values: "falsy" })
    .trim()
    .toLowerCase()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("marital_status")
    .optional({ values: "falsy" })
    .trim()
    .toLowerCase()
    .isIn(["single", "married", "divorced", "widowed"])
    .withMessage("Invalid marital status"),
  body("apartment_no")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Apartment number cannot be empty"),
  body("resident_count")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("Resident count must be a non-negative integer"),
  body("email").not().exists().withMessage("Email cannot be updated"),
  body("nic_passport").not().exists().withMessage("NIC/Passport cannot be updated"),
];

// GET /api/resident/profile — Get current resident's profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getResidentProfile(userId);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    if (error.message === "PROFILE_NOT_FOUND") {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(500).json({
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// PUT /api/resident/profile — Update current resident's profile
const updateProfile = [
  ...updateProfileValidation,
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const userId = req.user.id;
      const {
        first_name,
        last_name,
        phone,
        date_of_birth,
        gender,
        marital_status,
        apartment_no,
        resident_count,
      } = req.body;

      const updateData = {};
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (phone !== undefined) updateData.phone = phone;
      if (date_of_birth !== undefined && date_of_birth !== null && date_of_birth !== "") {
        updateData.date_of_birth = date_of_birth;
      }
      if (gender !== undefined && gender !== null && gender !== "") updateData.gender = gender;
      if (marital_status !== undefined && marital_status !== null && marital_status !== "") {
        updateData.marital_status = marital_status;
      }
      if (apartment_no !== undefined && apartment_no !== null && apartment_no !== "") {
        updateData.apartment_no = apartment_no;
      }
      if (resident_count !== undefined && resident_count !== null && resident_count !== "") {
        updateData.resident_count = Number.parseInt(resident_count, 10);
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      const updatedProfile = await updateResidentProfile(userId, updateData);

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } catch (error) {
      console.error("Update profile error:", error.message);

      if (error.message === "PROFILE_NOT_FOUND") {
        return res.status(404).json({ message: "Profile not found" });
      }

      return res.status(500).json({
        message: "Failed to update profile",
        error: error.message,
      });
    }
  },
];

export { getProfile, updateProfile };
