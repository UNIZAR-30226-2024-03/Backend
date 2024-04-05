import { Router } from "express";

import { validate } from "../middleware/validator/index.js";
import * as authValidatorJs from "../middleware/validator/authValidator.js";
import * as controller from "../controllers/authController.js";

const router = Router();

router.get(
  "/google", 
  validate(authValidatorJs.authGoogleSchema),
  controller.authGoogleLogin);

router.get(
  "/login",
  validate(authValidatorJs.authLoginSchema),
  controller.authLogin,
);

router.post(
  "/signup",
  validate(authValidatorJs.authSignupSchema),
  controller.authSignup,
);

export default router;
