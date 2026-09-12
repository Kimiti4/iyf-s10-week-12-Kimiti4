/**
 * 🔹 Task 20.2: Validation Middleware
 *
 * R4 [M5]: the `author` body requirement is removed from post/comment
 * validation. Authorship is authoritatively derived server-side from the
 * JWT (authorId = req.user.id); a client-supplied `author` string must not
 * determine ownership. Authorization is unchanged (author/admin checks in
 * the controllers still apply).
 */
const validatePost = (req, res, next) => {
  const { title, content, category } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) errors.push('Title ≥3 chars');
  if (!content || content.trim().length < 10) errors.push('Content ≥10 chars');

  const validCategories = ['mtaani', 'skill', 'farm', 'gig', 'alert'];
  if (!category || !validCategories.includes(category)) {
    errors.push(`Category must be: ${validCategories.join('|')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: 'Validation failed', errors });
  }

  // Sanitize
  req.body.title = title.trim();
  req.body.content = content.trim();

  next();
};

const validateComment = (req, res, next) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, error: 'Comment required' });

  req.body.content = content.trim();

  next();
};

module.exports = { validatePost, validateComment };
