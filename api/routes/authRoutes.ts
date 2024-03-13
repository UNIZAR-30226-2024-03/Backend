import { Router } from "express";

import { validate } from "../middleware/validator/index.js";
import * as authValidatorJs from "../middleware/validator/authValidator.js";
import * as controller from "../controllers/authController.js";

const router = Router();

router.get("/google-login", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Google OAuth 2.0 Test</title>
        <script>
          function authenticateWithGoogle() {
            const clientId = '142160517264-onqamvf7nnprkdvj9oeflokhs17g1d7g.apps.googleusercontent.com'; // Replace with your client ID
            const redirectUri = encodeURIComponent('http://localhost:3000/api/auth/google'); // Replace your redirect URI
            const scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.email');
            const responseType = 'code';
            const url = \`https://accounts.google.com/o/oauth2/v2/auth?client_id=\${clientId}&redirect_uri=\${redirectUri}&response_type=\${responseType}&scope=\${scope}\`;

            window.location.href = url;
          }
        </script>
      </head>
      <body>
        <button onclick="authenticateWithGoogle()">Authenticate with Google</button>
      </body>
    </html>
  `);
});

router.get("/google-web", controller.authGoogleLogin);

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
