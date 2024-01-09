import UserSchema from './UserSchema.js';

//insert new user
//insert new user
export const insertUser = (userObj) => {
  return UserSchema(userObj).save();
};

export const updatetUser = (filter, update) => {
  return UserSchema.findOneAndUpdate(filter, update, { new: true });
};
