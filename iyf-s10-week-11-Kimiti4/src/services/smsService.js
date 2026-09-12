const AFRICAS_TALKING_URL = 'https://api.africastalking.com/version1/messaging'

function isConfigured() {
  return Boolean(process.env.AT_USERNAME && process.env.AT_API_KEY)
}

async function sendSMS(to, message, senderId = process.env.AT_SENDER_ID || 'JamiiLink') {
  if (!isConfigured()) {
    console.warn('[sms] Africa\'s Talking credentials are not configured')
    return { skipped: true, reason: 'not_configured' }
  }

  const body = new URLSearchParams({
    username: process.env.AT_USERNAME,
    to: Array.isArray(to) ? to.join(',') : to,
    message,
    from: senderId,
  })

  const response = await fetch(AFRICAS_TALKING_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      apiKey: process.env.AT_API_KEY,
    },
    body,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data?.SMSMessageData?.Message || `SMS provider returned ${response.status}`)
    error.statusCode = response.status
    throw error
  }
  return data
}

async function notifyWithSmsFallback({ user, message, sendPush }) {
  try {
    await sendPush(user)
    return { channel: 'push' }
  } catch (pushError) {
    if (!user?.phone || !user.smsOptIn) {
      return { channel: 'none', reason: 'sms_not_opted_in', pushError }
    }
    await sendSMS(user.phone, message)
    return { channel: 'sms' }
  }
}

module.exports = { sendSMS, notifyWithSmsFallback }