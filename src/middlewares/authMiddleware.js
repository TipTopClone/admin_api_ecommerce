import { getSession } from '../modules/session/SessionSchema.js';
import { getAUser } from '../modules/user/UserModule.js';
import {
  createAccessJWT,
  verifyAccessJWT,
  verifyRefreshJWT,
} from '../utils/jwt.js';
import { responder } from './response.js';

export const adminAuth = async (req, res, next) => {
  try {
    //get the accessJWT and verify
    const { authorization } = req.headers;
    const decoded = await verifyAccessJWT(authorization);

    if (decoded?.email) {
      //check if the token is in the database
      const token = await getSession({
        token: authorization,
        associate: decoded.email,
      });

      if (token?._id) {
        //get user by email
        const user = await getAUser({ email: decoded.email });

        if (user?.status === 'active' && user?.role === 'admin') {
          user.password = undefined;
          req.userInfo = user;
          return next();
        }
      }
    }
    responder.ERROR({
      res,
      message: 'Unauthorized',
      errorCode: 401,
    });
  } catch (error) {
    // if token is expired, handle error
    if (error.message.includes('jwt expired')) {
      return responder.ERROR({
        res,
        errorCode: 403,
        message: 'jwt expired',
      });
    }
    next(error);
  }
};

export const refreshAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers; //refreshJWT

    const decoded = await verifyRefreshJWT(authorization);
    if (decoded?.email) {
      const user = await getAUser({
        email: decoded.email,
        refreshJWT: authorization,
      });

      if (user?._id && user?.status === 'active') {
        const accessJWT = await createAccessJWT(decoded.email);

        return responder.SUCCESS({
          res,
          message: 'Here is the accessJWT',
          accessJWT,
        });
      }
    }
    responder.ERROR({
      res,
      errorCode: 401,
      message: 'Unauthorized',
    });
  } catch (error) {
    next(error);
  }
};
