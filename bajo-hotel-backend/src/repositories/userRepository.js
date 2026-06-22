import prisma from '../config/prisma.js';

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};

export const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      createdAt: true
    }
  });
};

export const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      createdAt: true
    }
  });
};
