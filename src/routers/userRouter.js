import express from 'express';
import {
  getAUser,
  insertUser,
  updateUser,
} from '../modules/user/UserModule.js';
import { comparePassword, hashPassword } from '../utils/bcrypt.js';
import { newAdminValidation } from '../middlewares/joiValidation.js';
import { responder } from '../middlewares/response.js';
import { v4 as uuidv4 } from 'uuid';
import {
  createNewSession,
  deleteSession,
} from '../modules/session/SessionSchema.js';
import {
  sendEmailVerificationLinkEmail,
  sendEmailVerifyNotification,
  sendOtpEmail,
} from '../utils/nodeMailer.js';
import { getJWTs } from '../utils/jwt.js';
import { adminAuth, refreshAuth } from '../middlewares/authMiddleware.js';
import { otpGenerator } from '../utils/randomGenerator.js';

const router = express.Router();

//verify user email

router.post('/verify-email', async (req, res, next) => {
  try {
    const { associate, token } = req.body;
    if (associate && token) {
      //delete from session
      const session = await deleteSession({ token, associate });
      //if success, then update user status to active
      if (session?._id) {
        //update user table
        const user = await updateUser(
          { email: associate },
          { status: 'active' }
        );

        //send email notifications
        if (user?._id) {
          sendEmailVerifyNotification({ email: associate, fName: user.fName });
          return responder.SUCCESS({
            res,
            message: 'Your email has been verified. You may signIn now.',
          });
        }
      }
    }
    responder.ERROR({
      res,
      message: 'Invalid or expired link',
    });
  } catch (error) {
    next(error);
  }
});

//login user
router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      // get user by email

      const user = await getAUser({ email });
      if (user?.status === 'inactive') {
        return responder.ERROR({
          res,
          message:
            'Your accout has not been verifed. Chek your email to verify or contact admin',
        });
      }

      if (user?._id) {
        // verify password matched

        const isPassMatched = comparePassword(password, user.password);

        if (isPassMatched) {
          // create and store tokens

          const jwts = await getJWTs(email);
          // response tokens
          return responder.SUCCESS({
            res,
            message: 'Login successfully',
            jwts,
          });
        }
      }
    }
    responder.ERROR({
      res,
      message: 'Invalid Login Details',
    });
  } catch (error) {
    next(error);
  }
});

//private router
//add server side validation
router.post('/', newAdminValidation, async (req, res, next) => {
  try {
    const { password } = req.body;
    //encrypt the password
    req.body.password = hashPassword(password);

    const user = await insertUser(req.body);

    //if user is created, create unique url and email that to user
    if (user?._id) {
      const c = uuidv4(); //this must be store in DB

      const token = await createNewSession({ token: c, associate: user.email });

      if (token?._id) {
        const url = `${process.env.CLIENT_ROOT_DOMAIN}/verify-email?e=${user.email}&c=${c}`;
        sendEmailVerificationLinkEmail({
          email: user.email,
          url,
          fName: user.fName,
        });

        //send new email
      }
    }

    user?._id
      ? responder.SUCCESS({
          res,
          message:
            'The user has been created. Check your email to verify your account',
        })
      : responder.ERROR({
          res,
          errorCode: 200,
          message: ' Unable to create new user, try again later',
        });
  } catch (error) {
    if (error.message.includes('E11000 duplicate key error collection')) {
      error.message = 'There is already an user with this email in our system';
      error.errorCode = 200;
    }
    next(error);
  }
});

//get user profile by user login

router.get('/', adminAuth, (req, res, next) => {
  try {
    responder.SUCCESS({
      res,
      message: 'here is the user data',
      user: req.userInfo,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/get-accessjwt', refreshAuth);

//logout
router.post('/logout', async (req, res, next) => {
  try {
    const { accessJWT, _id } = req.body;
    accessJWT &&
      (await deleteSession({
        token: accessJWT,
      }));
    await updateUser({ _id }, { refreshJWT: '' });
    responder.SUCCESS({
      res,
      message: 'User loged Out successfully',
    });
  } catch (error) {
    next(error);
  }
});

//otp request
router.post('/request-otp', async (req, res, next) => {
  try {
    //check if user exist
    const { email } = req.body;
    if (email.includes('@')) {
      const user = await getAUser({ email });

      if (user?._id) {
        //create unique OTP
        const otp = otpGenerator();
        //store otp and email in session table
        const otpSession = await createNewSession({
          token: otp,
          associate: email,
        });

        if (otpSession?._id) {
          //send email to user
          sendOtpEmail({
            fName: user.fName,
            email,
            otp,
          });
        }
      }
    }
    //response user
    responder.SUCCESS({
      res,
      message:
        'If your email is found in our system,we will send the OTP to your email. Please check your Junk/Spam folder as well',
    });
  } catch (error) {
    next(error);
  }
});

//password update
export default router;
