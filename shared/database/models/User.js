const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: 'uniq_username'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: 'uniq_email',
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    phone: DataTypes.STRING(20),
    mobile: DataTypes.STRING(20),
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLoginAt: DataTypes.DATE,
    passwordChangedAt: DataTypes.DATE,
    passwordExpiresAt: DataTypes.DATE,
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lockedUntil: DataTypes.DATE,
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    twoFactorSecret: DataTypes.STRING(255),
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'users',
    indexes: [
      { fields: ['username'] },
      { fields: ['email'] },
      { fields: ['role_id'] },
      { fields: ['is_active'] }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
          user.passwordChangedAt = new Date();
        }
      }
    }
  });

  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`.trim();
  };

  User.prototype.isLockedOut = function() {
    if (!this.isLocked || !this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  };

  User.prototype.incrementFailedAttempts = async function() {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 5) {
      this.isLocked = true;
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await this.save();
  };

  User.prototype.resetFailedAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.isLocked = false;
    this.lockedUntil = null;
    await this.save();
  };

  return User;
};
