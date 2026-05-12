const express = require('express');
const router = express.Router();

/**
 *  Tiannara AI - Mental Health Support
 * Provides emotional support and crisis resources
 */
router.post('/mental-health', async (req, res) => {
  try {
    const { message, userId } = req.body;

    // Simulate AI analysis (replace with actual Tiannara API)
    const sentiment = analyzeSentiment(message);
    const urgency = detectUrgency(message);
    
    let response = {
      success: true,
      message: generateSupportMessage(sentiment, urgency),
      resources: getMentalHealthResources(urgency)
    };

    // If high urgency, escalate to crisis support
    if (urgency === 'high') {
      response.escalation = {
        type: 'crisis',
        immediateAction: true,
        hotline: '1199'
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Tiannara mental health error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to provide support at this time. Please contact a professional.'
    });
  }
});

/**
 *  Tiannara AI - Fact Checking
 * Verifies information and detects misinformation
 */
router.post('/fact-check', async (req, res) => {
  try {
    const { message, postId } = req.body;

    // Simulate fact-checking (replace with actual verification API)
    const factCheck = await performFactCheck(message);

    res.json({
      success: true,
      factCheck: {
        verdict: factCheck.verdict, // 'true', 'false', 'misleading', 'unverified'
        confidence: factCheck.confidence,
        explanation: factCheck.explanation,
        sources: factCheck.sources || []
      },
      recommendation: getRecommendation(factCheck.verdict)
    });
  } catch (error) {
    console.error('Tiannara fact-check error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to verify information at this time.'
    });
  }
});

/**
 *  Tiannara AI - Content Moderation
 * Detects harmful content and enforces community guidelines
 */
router.post('/moderate', async (req, res) => {
  try {
    const { content, contentType } = req.body;

    // Analyze content for violations
    const moderation = analyzeContent(content);

    res.json({
      success: true,
      moderation: {
        safe: moderation.safe,
        violations: moderation.violations || [],
        severity: moderation.severity, // 'low', 'medium', 'high'
        action: moderation.action, // 'allow', 'flag', 'remove'
        explanation: moderation.explanation
      }
    });
  } catch (error) {
    console.error('Tiannara moderation error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to moderate content at this time.'
    });
  }
});

// Helper Functions

function analyzeSentiment(text) {
  // Simple keyword-based sentiment analysis
  const positiveWords = ['happy', 'good', 'great', 'excited', 'grateful'];
  const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'scared'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score--;
  });
  
  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
}

function detectUrgency(text) {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'hurt myself',
    'can\'t take it anymore', 'no reason to live'
  ];
  
  const lowerText = text.toLowerCase();
  
  for (const keyword of crisisKeywords) {
    if (lowerText.includes(keyword)) {
      return 'high';
    }
  }
  
  return 'normal';
}

function generateSupportMessage(sentiment, urgency) {
  if (urgency === 'high') {
    return "I'm concerned about what you're sharing. You're not alone, and help is available right now. Please reach out to our crisis team immediately.";
  }
  
  switch (sentiment) {
    case 'negative':
      return "I hear that you're going through a difficult time. It's okay to feel this way, and there are people who care about you. Would you like to talk more about what's on your mind?";
    case 'positive':
      return "I'm glad to hear you're feeling good! Remember to celebrate the small victories. Is there anything specific you'd like to share or discuss?";
    default:
      return "Thank you for sharing. I'm here to listen and support you. How can I help you today?";
  }
}

function getMentalHealthResources(urgency) {
  if (urgency === 'high') {
    return [
      'National Suicide Prevention Hotline: 1199 (24/7)',
      'Mental Health Foundation Kenya: +254 722 444 555',
      'Emergency Services: 999',
      'Visit nearest hospital emergency room'
    ];
  }
  
  return [
    'Talk to a trusted friend or family member',
    'Practice self-care activities',
    'Consider speaking with a counselor',
    'Join a support group in your community'
  ];
}

async function performFactCheck(text) {
  // Placeholder - integrate with actual fact-checking API
  // For now, return simulated results
  
  const commonMisinformation = [
    'vaccine causes autism',
    'climate change is hoax',
    'earth is flat'
  ];
  
  const lowerText = text.toLowerCase();
  
  for (const claim of commonMisinformation) {
    if (lowerText.includes(claim)) {
      return {
        verdict: 'false',
        confidence: 0.95,
        explanation: 'This claim has been thoroughly debunked by scientific research.',
        sources: ['WHO', 'CDC', 'Scientific Journals']
      };
    }
  }
  
  return {
    verdict: 'unverified',
    confidence: 0.5,
    explanation: 'Unable to verify this claim. Please consult multiple reliable sources.',
    sources: []
  };
}

function getRecommendation(verdict) {
  switch (verdict) {
    case 'true':
      return 'This information appears accurate.';
    case 'false':
      return 'This information is incorrect. Please be cautious about sharing.';
    case 'misleading':
      return 'This information may be misleading. Verify with additional sources.';
    default:
      return 'Unable to verify. Exercise caution when sharing.';
  }
}

function analyzeContent(content) {
  // Simple content moderation
  const harmfulKeywords = [
    'hate speech', 'violence', 'threat', 'harassment'
  ];
  
  const lowerContent = content.toLowerCase();
  const violations = [];
  
  harmfulKeywords.forEach(keyword => {
    if (lowerContent.includes(keyword)) {
      violations.push(keyword);
    }
  });
  
  if (violations.length > 0) {
    return {
      safe: false,
      violations,
      severity: violations.length > 2 ? 'high' : 'medium',
      action: violations.length > 2 ? 'remove' : 'flag',
      explanation: `Content contains potential violations: ${violations.join(', ')}`
    };
  }
  
  return {
    safe: true,
    violations: [],
    severity: 'none',
    action: 'allow',
    explanation: 'Content appears to follow community guidelines.'
  };
}

module.exports = router;
