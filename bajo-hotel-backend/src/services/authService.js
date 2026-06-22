import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyforhotelbookingapp123!';

export const registerUser = async (fullName, email, password, phone) => {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email sudah terdaftar');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  return await userRepository.createUser({
    fullName,
    email,
    passwordHash,
    phone
  });
};

export const loginUser = async (email, password) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('Email atau password salah');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    throw new Error('Email atau password salah');
  }

  const token = jwt.sign(
    { id: user.id, userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone
    },
    token
  };
};
