/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Operations related to authentication
 */

import { Router } from "express";

import { validate } from "../middleware/validator/index.js";
import * as authValidatorJs from "../middleware/validator/authValidator.js";
import * as controller from "../controllers/authController.js";

const router = Router();

/**
 * @swagger
 * /google:
 *  get:
 *    summary: Sending credentials issued by Google
 *    description: Verifies the credentials issued by Google to authenticate the user. If the user is already registered, it returns the authentication token. If the user is not registered, it creates a new user account and returns the authentication token.
 *    tags: [Auth]
 *    responses:
 *      200:
 *        description: Success, returns the authentication token
 *      401:
 *        description: Unauthorized by Google. Invalid token.
 *      500:
 *        description: Server error.
 */
router.get(
  "/google", 
  validate(authValidatorJs.authGoogleSchema),
  controller.authGoogleLogin
);

/**
 * @swagger
 * /login:
 *  post:
 *    summary: User login
 *    description: Authenticates the user with the provided login credentials.
 *    tags: [Auth]
 *    parameters:
 *      - in: body
 *        name: email
 *        type: string
 *      - in: body
 *        name: contrasegna
 *        type: string
 *    responses:
 *      200:
 *        description: Success, returns the authentication token
 *        content:
 *          text/plain:
 *            schema:
 *              type: string
 *              example: yourtoken
 *      401:
 *        description: Unauthorized. Invalid credentials.
 *      500:
 *        description: Server error.
 */
router.post(
  "/login",
  validate(authValidatorJs.authLoginSchema),
  controller.authLogin,
);

/**
 * @swagger
 * /signup:
 *  post:
 *    summary: User signup
 *    description: Creates a new user account with the provided signup details. This includes the creation of the default lists.
 *    tags: [Auth]
 *    parameters:
 *      - in: body
 *        name: email
 *        type: string
 *      - in: body
 *        name: nombreUsuario
 *        type: string
 *      - in: body
 *        name: contrasegna
 *        type: string
 *    responses:
 *      201:
 *        description: Success, returns the authentication token
 *        content:
 *          text/plain:
 *            schema:
 *              type: string
 *              example: yourtoken
 *      400:
 *        description: Bad request. Invalid signup details.
 *      500:
 *        description: Server error.
 */
router.post(
  "/signup",
  validate(authValidatorJs.authSignupSchema),
  controller.authSignup,
);

export default router;
