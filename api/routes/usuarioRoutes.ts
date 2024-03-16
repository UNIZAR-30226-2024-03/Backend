import { Router } from "express";

import * as auth from "../middleware/authenticator.js";
import { validate } from "../middleware/validator/index.js";
import * as usuarioValidatorJs from "../middleware/validator/usuarioValidator.js";
import * as usuarioCon from "../controllers/usuarioController.js";

const router = Router();

router.get(
  "/",
  auth.optionalAuthenticate,
  validate(usuarioValidatorJs.usuarioGetSchema),
  usuarioCon.usuarioGet,
);

router.put(
  "/",
  auth.authenticate,
  validate(usuarioValidatorJs.usuarioModifySchema),
  usuarioCon.usuarioModify,
);

router.put(
  "/follow",
  auth.authenticate,
  validate(usuarioValidatorJs.usuarioFollowSchema),
  usuarioCon.usuarioFollow,
);

router.put(
  "/unfollow",
  auth.authenticate,
  validate(usuarioValidatorJs.usuarioUnfollowSchema),
  usuarioCon.usuarioUnfollow,
);

export default router;
