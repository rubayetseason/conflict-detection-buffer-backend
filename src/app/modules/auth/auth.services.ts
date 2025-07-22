import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import {
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';
import { isPasswordMatched } from './auth.utils';

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  //check user exists
  const checkUserExist = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!checkUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exists');
  }
  //match password
  const isPasswordMatchedHere = await isPasswordMatched(
    password,
    checkUserExist.password
  );

  if (!isPasswordMatchedHere) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  const { email: userEmail } = checkUserExist;

  //access token
  const accessToken = jwtHelpers.createToken(
    { userEmail },
    config.jwt.secret as Secret,
    { expiresIn: config.jwt.expires_in }
  );

  //refresh token
  const refreshToken = jwtHelpers.createToken(
    { userEmail },
    config.jwt.refresh_secret as Secret,
    { expiresIn: config.jwt.refresh_expires_in }
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  //verify token
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
    //in verifiedToken, we get user id, role, timestamps
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token');
  }
  const { email } = verifiedToken;
  //checking deleted user using refresh token
  //check user exists
  const checkUserExist = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!checkUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exists');
  }

  //generate new token
  const accessToken = jwtHelpers.createToken(
    {
      email: checkUserExist?.email,
    },
    config.jwt.secret as Secret,
    { expiresIn: config.jwt.expires_in }
  );

  return {
    accessToken,
  };
};

const createUser = async (data: User): Promise<User> => {
  //hashed the user password
  data.password = await bcrypt.hash(
    data.password,
    Number(config.bycrypt_salt_rounds)
  );

  const result = await prisma.user.create({
    data,
  });
  return result;
};

export const AuthService = {
  loginUser,
  refreshToken,
  createUser,
};
