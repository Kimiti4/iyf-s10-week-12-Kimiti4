const PDFDocument = require('pdfkit');

/**
 * Generate a PDF Reputation Passport
 */
exports.generatePassportPDF = (passport, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=passport-${passport.passport_id}.pdf`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).fillColor('#16a34a').text('JamiiLink Reputation Passport', { align: 'center' });
  doc.moveDown();

  doc.fontSize(10).fillColor('#64748b').text(`Passport ID: ${passport.passport_id}`, { align: 'center' });
  doc.text(`Issued At: ${passport.issued_at}`, { align: 'center' });
  doc.moveDown(2);

  // Identity
  doc.fontSize(14).fillColor('#0f172a').text('Identity');
  doc.fontSize(12).fillColor('#334155').text(`Name: ${passport.identity.username ?? passport.identity.name ?? '—'}`);
  doc.text(`User ID: ${passport.user_id}`);
  doc.text(`Verified Since: ${new Date(passport.identity.verified_since).toLocaleDateString()}`);
  doc.moveDown();

  // Reputation
  doc.fontSize(14).fillColor('#0f172a').text('Reputation');
  doc.fontSize(12).fillColor('#334155').text(`Total Score: ${passport.reputation.total_score} points (Level ${passport.reputation.level})`);
  doc.text(`Rank: ${passport.reputation.rank}`);
  doc.moveDown();

  // Impact (graceful when incomplete)
  doc.fontSize(14).fillColor('#0f172a').text('Impact');
  if (Array.isArray(passport.impact?.activity)) {
    passport.impact.activity.forEach(act => {
      doc.fontSize(12).fillColor('#334155').text(`- ${act.count} ${act.label}`);
    });
  } else {
    doc.fontSize(12).fillColor('#64748b').text('Impact activity unavailable');
  }
  doc.moveDown();

  // Skills
  doc.fontSize(14).fillColor('#0f172a').text('Skills');
  if (Array.isArray(passport.skills) && passport.skills.length > 0) {
    passport.skills.forEach(skill => {
      doc.fontSize(12).fillColor('#334155').text(`- ${skill.name} (${skill.role}, proficiency ${skill.proficiency})`);
    });
  } else {
    doc.fontSize(12).fillColor('#64748b').text('No skills recorded');
  }
  doc.moveDown();

  // Achievements
  doc.fontSize(14).fillColor('#0f172a').text('Achievements');
  if (Array.isArray(passport.achievements?.badges)) {
    passport.achievements.badges.forEach(badge => {
      doc.fontSize(12).fillColor('#334155').text(`- ${badge.title} (Earned: ${new Date(badge.earned).toLocaleDateString()})`);
    });
  } else {
    doc.fontSize(12).fillColor('#64748b').text('No achievements recorded');
  }
  doc.moveDown(3);

  // Verification Hash
  doc.fontSize(10).fillColor('#16a34a').text('Verifiable Artifact Digest', { align: 'center' });
  doc.fontSize(8).fillColor('#64748b').text(`Algorithm: ${passport.digest_algorithm}`, { align: 'center' });
  doc.text(passport.digest, { align: 'center' });

  doc.end();
};
