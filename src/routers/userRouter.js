import express from 'express';
import { insertUser, updatetUser } from '../modules/user/UserModule.js';
import { hashPassword } from '../utils/bcrypt.js';
import { newAdminValidation } from '../middlewares/joiValidation.js';
import { responder } from '../middlewares/response.js';
import { v4 as uuidv4 } from 'uuid';
import {
  createNewSession,
  deleteSession,
} from '../modules/session/SessionSchema.js';
import { sendEmailVerificationLinkEmail } from '../utils/nodeMailer.js';

const router = express.Router();

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
        const url = `${process.CLIENT_ROOT_DOMAIN}/verify-email?
        email=${user.email}&c=${c}`;
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

//verify user email

router.post('/verify-email', async (req, res, next) => {
  try {
    const { associate, token } = req.body;
    if (email && token) {
      //delete from session
      const session = await deleteSession({ token, associate });
      //if success, then update user status to active
      if (session?._id) {
        //update user table
        const user = await updatetUser({ email }, { status: 'active' });

        //send email notifications
        if (user?._id) {
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

export default router;
