export interface ModerationResult {
  safe: boolean
  reason?: string
  flaggedTerms?: string[]
}

const BLOCKED_TERMS: Record<string, string[]> = {
  weapons: [
    'gun', 'guns', 'pistol', 'rifle', 'firearm', 'ammunition', 'ammo', 'bullet',
    'explosive', 'bomb', 'grenade', 'ak47', 'ak-47', 'weapon', 'weapons',
    'handgun', 'shotgun', 'revolver', 'silencer', 'suppressor',
  ],
  drugs: [
    'cocaine', 'heroin', 'meth', 'methamphetamine', 'marijuana', 'weed', 'cannabis',
    'mdma', 'ecstasy', 'lsd', 'crack', 'narcotics', 'drug dealer', 'drug dealing',
    'khat', 'crystal meth', 'dagga',
  ],
  adult: [
    'porn', 'pornography', 'xxx', 'explicit', 'nude', 'naked', 'escort',
    'prostitution', 'sex work', 'adult content', 'onlyfans',
  ],
  illegal: [
    'stolen', 'counterfeit', 'fake', 'pirated', 'smuggled', 'traffick',
    'money laundering', 'bribery', 'illegal',
  ],
}

const FLAGGED_CATEGORIES: Record<string, string[]> = {
  suspicious_pricing: ['free money', 'make money fast', 'get rich quick', 'pyramid'],
}

export function moderateText(text: string): ModerationResult {
  const lowerText = text.toLowerCase()
  const flaggedTerms: string[] = []
  let category = ''

  for (const [cat, terms] of Object.entries(BLOCKED_TERMS)) {
    for (const term of terms) {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(lowerText)) {
        flaggedTerms.push(term)
        category = cat
      }
    }
  }

  if (flaggedTerms.length > 0) {
    const reasonMap: Record<string, string> = {
      weapons: 'Weapons and firearms are not allowed on ZIM MALL.',
      drugs: 'Illegal drugs and controlled substances are not allowed.',
      adult: 'Adult content is not permitted on this platform.',
      illegal: 'This content appears to involve illegal activities.',
    }

    return {
      safe: false,
      reason: reasonMap[category] || 'Content violates our community guidelines.',
      flaggedTerms,
    }
  }

  // Check suspicious patterns
  for (const [cat, patterns] of Object.entries(FLAGGED_CATEGORIES)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        flaggedTerms.push(pattern)
        category = cat
      }
    }
  }

  if (flaggedTerms.length > 0) {
    return {
      safe: false,
      reason: 'Content appears suspicious or misleading.',
      flaggedTerms,
    }
  }

  return { safe: true }
}

export function moderateProductListing(
  name: string,
  description: string,
  category: string
): ModerationResult {
  const combined = `${name} ${description} ${category}`
  return moderateText(combined)
}

export function moderateReview(comment: string): ModerationResult {
  // More lenient for reviews — only block hard categories
  const lowerText = comment.toLowerCase()
  const flaggedTerms: string[] = []

  const hardBlockTerms = [...BLOCKED_TERMS.weapons, ...BLOCKED_TERMS.drugs, ...BLOCKED_TERMS.adult]

  for (const term of hardBlockTerms) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (regex.test(lowerText)) {
      flaggedTerms.push(term)
    }
  }

  if (flaggedTerms.length > 0) {
    return {
      safe: false,
      reason: 'Review contains inappropriate content.',
      flaggedTerms,
    }
  }

  return { safe: true }
}
