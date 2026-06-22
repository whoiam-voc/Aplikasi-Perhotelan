import * as userService from '../services/userService.js';

export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap, email, dan password wajib diisi'
      });
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal terdiri dari 6 karakter'
      });
    }

    const newUser = await userService.registerUser(fullName, email, password, phone);
    
    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: newUser
    });
  } catch (error) {
    const statusCode = error.message === 'Email sudah terdaftar' ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi'
      });
    }

    const loginData = await userService.loginUser(email, password);
    
    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: loginData
    });
  } catch (error) {
    const statusCode = error.message === 'Email atau password salah' ? 401 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await userService.getUserProfile(userId);
    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    const statusCode = error.message === 'User tidak ditemukan' ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server'
    });
  }
};
