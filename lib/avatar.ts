export const AVATAR_HEX: Record<string, string> = {
  lime: '#c8ff4d',
  violet: '#7a6ff0',
  blue: '#4ea8ff',
  pink: '#ff6fb0',
  orange: '#ff9f4d',
  red: '#ff6161',
  teal: '#4de6c8',
  gold: '#ffcf3d',
  purple: '#c86fff',
  mint: '#4dffa0',
}

export function getAvatarHex(avatar: string): string {
  return AVATAR_HEX[avatar] ?? AVATAR_HEX.lime
}
