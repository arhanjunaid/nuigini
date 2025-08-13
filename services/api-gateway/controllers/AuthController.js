const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { models } = require('../../../shared/database');
const logger = require('../utils/logger');

class AuthController {
  /**
   * User login
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find user by username or email
      const user = await models.User.findOne({
        where: {
          [models.Sequelize.Op.or]: [
            { username: username },
            { email: username }
          ],
          isActive: true
        },
        include: [
          {
            model: models.Role,
            attributes: ['id', 'name', 'permissions']
          }
        ]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate tokens
      const accessToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.Role.name,
          permissions: user.Role.permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.Role.name,
            permissions: user.Role.permissions
          },
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * User registration
   */
  static async register(req, res) {
    try {
      const { username, email, password, firstName, lastName, roleId } = req.body;

      // Check if user already exists
      const existingUser = await models.User.findOne({
        where: {
          [models.Sequelize.Op.or]: [
            { username: username },
            { email: email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists'
        });
      }

      // Create user
      const user = await models.User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        roleId: roleId || 'default-role-id' // You should have a default role
      });

      // Get user with role
      const userWithRole = await models.User.findByPk(user.id, {
        include: [
          {
            model: models.Role,
            attributes: ['id', 'name', 'permissions']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: userWithRole.id,
            username: userWithRole.username,
            email: userWithRole.email,
            firstName: userWithRole.firstName,
            lastName: userWithRole.lastName,
            role: userWithRole.Role.name
          },
          message: 'User created successfully'
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Get user
      const user = await models.User.findByPk(decoded.userId, {
        include: [
          {
            model: models.Role,
            attributes: ['id', 'name', 'permissions']
          }
        ]
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
          role: user.Role.name,
          permissions: user.Role.permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  }

  /**
   * User logout
   */
  static async logout(req, res) {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return success
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }
}

module.exports = AuthController; 