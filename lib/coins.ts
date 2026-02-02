// Coin package types
export interface CoinPackage {
  hours: number
  coins: number
  label: string
}

export const COIN_PACKAGES: CoinPackage[] = [
  { hours: 24, coins: 1, label: '24 Stunden' },
  { hours: 168, coins: 3, label: '7 Tage' },  // 7 * 24 = 168 hours
  { hours: 720, coins: 5, label: '30 Tage' }  // 30 * 24 = 720 hours (approximate month)
]

// Calculate new pass valid until date when redeeming a package
export function calculateNewPassValidUntil(currentValidUntil: Date | null, hours: number): Date {
  const now = new Date()
  const baseTime = currentValidUntil && currentValidUntil > now ? currentValidUntil : now
  return new Date(baseTime.getTime() + hours * 60 * 60 * 1000)
}

// Check if user has valid pass
export function hasValidPass(passValidUntil: Date | null): boolean {
  if (!passValidUntil) return false
  return passValidUntil > new Date()
}

// Get remaining time in minutes
export function getRemainingMinutes(passValidUntil: Date | null): number {
  if (!passValidUntil) return 0
  const now = new Date()
  if (passValidUntil <= now) return 0
  return Math.floor((passValidUntil.getTime() - now.getTime()) / (1000 * 60))
}

// Format remaining time for display
export function formatRemainingTime(passValidUntil: Date | null): string {
  const minutes = getRemainingMinutes(passValidUntil)
  if (minutes <= 0) return 'Abgelaufen'
  
  const days = Math.floor(minutes / (24 * 60))
  const hours = Math.floor((minutes % (24 * 60)) / 60)
  const mins = minutes % 60
  
  if (days > 0) {
    return `${days}d ${hours}h ${mins}m`
  } else if (hours > 0) {
    return `${hours}h ${mins}m`
  } else {
    return `${mins}m`
  }
}
