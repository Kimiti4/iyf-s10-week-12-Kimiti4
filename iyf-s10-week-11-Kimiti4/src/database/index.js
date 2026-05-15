/**
 * 🔹 Database Repositories Index
 * Export all PostgreSQL repositories
 */
const UserRepository = require('./repositories/UserRepository');
const PostRepository = require('./repositories/PostRepository');
const OrganizationRepository = require('./repositories/OrganizationRepository');
const CommentRepository = require('./repositories/CommentRepository');
const UsersRepository = require('./repositories/UsersRepository');

module.exports = {
  UserRepository,
  PostRepository,
  OrganizationRepository,
  CommentRepository,
  UsersRepository
};
