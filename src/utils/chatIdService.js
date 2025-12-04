/**
 * Chat ID Service
 * Generates readable session IDs for differentiating chat conversations
 * Format: AGENT_DDMM_RANDOM
 * Examples: HRV1_0412_sded, HRV2_0412_sde4, GAJO_0412_s3ed
 */

export function generateSimpleChatId(agentType = 'HRV1') {
  // Get date in DDMM format
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const dateStr = `${day}${month}`;
  
  // Generate 4 random alphanumeric characters
  const random = Math.random().toString(36).substring(2, 6);
  
  return `${agentType}_${dateStr}_${random}`;
}

export function generateHRDonnaChatId(version = 'v1') {
  return generateSimpleChatId(version === 'v2' ? 'HRV2' : 'HRV1');
}

export function generateGajodharChatId() {
  return generateSimpleChatId('GAJO');
}
