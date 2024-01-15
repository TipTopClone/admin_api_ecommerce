import jwt from 'jsonwebtoken';
import { createNewSession } from '../modules/session/SessionSchema.js';
import { updateUser } from '../modules/user/UserModule.js';
// create accessJWT
export const createAccessJWT = async (email) => {
  const accessJWT = jwt.sign({ email }, process.env.ACCESSJWT_SECRET, {
    expiresIn: '15m',
  });

  //store accessJWT in session table

  await createNewSession({
    token: accessJWT,
    associate: email,
  });

  return accessJWT;
};

export const verifyAccessJWT = async (accessJWT) => {
  return jwt.verify(accessJWT, process.env.ACCESSJWT_SECRET);
};

export const verifyRefreshJWT = async (refreshJWT) => {
  return jwt.verify(refreshJWT, process.env.REFRESHJWT_SECRET);
};

// create refreshJWT
export const createRefreshJWT = async (email) => {
  const refreshJWT = jwt.sign({ email }, process.env.REFRESHJWT_SECRET, {
    expiresIn: '30d',
  });

  // store in the user tale

  await updateUser(
    { email },
    {
      refreshJWT,
    }
  );
  return refreshJWT;
};

export const getJWTs = async (email) => {
  return {
    accessJWT: await createAccessJWT(email),
    refreshJWT: await createRefreshJWT(email),
  };
};
