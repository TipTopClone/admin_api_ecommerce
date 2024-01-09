import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    associate: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const SessionSchema = mongoose.model('Session', sessionSchema); //Sessions

//function to run crud

export const createNewSession = (obj) => {
  return SessionSchema(obj).save();
};
