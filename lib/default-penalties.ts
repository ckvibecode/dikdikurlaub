export const DEFAULT_PENALTY_TYPES: Array<{
  title: string
  consequence: string
  icon: string
  points: number
}> = [
  {
    title: 'Handy verloren/versenkt',
    consequence: 'Gibt der Gruppe eine Runde aus',
    icon: 'phone',
    points: 5,
  },
  {
    title: 'Zu spät zum Treffpunkt',
    consequence: 'Macht 10 Kniebeugen vor der Gruppe',
    icon: 'clock',
    points: 2,
  },
  {
    title: 'Sonnenbrand nicht vermieden',
    consequence: 'Trägt für einen Tag einen lustigen Hut',
    icon: 'sun',
    points: 1,
  },
  {
    title: 'Peinlicher Fotomoment verursacht',
    consequence: 'Das Foto wird Gruppen-Profilbild',
    icon: 'camera',
    points: 2,
  },
  {
    title: 'Getränk verschüttet',
    consequence: 'Muss den nächsten Drink der Runde bezahlen',
    icon: 'cup',
    points: 1,
  },
  {
    title: 'Im Restaurant eingeschlafen',
    consequence: 'Übernimmt morgen die Tagesplanung',
    icon: 'moon',
    points: 2,
  },
  {
    title: 'Falsche Richtung geführt',
    consequence: 'Trägt für den Rest des Tages die Gruppen-Karte',
    icon: 'map',
    points: 2,
  },
]
