export const FIGURES = {
  pikachu: {
    id: "pikachu",
    name: "Pikachu",
    mp: 3,
    rarity: "UC",
    wheel: [
      { type: "miss", label: "Miss", size: 8 },
      { type: "white", label: "Quick Attack", damage: 40, size: 32 },
      { type: "gold", label: "Thunder Shock", damage: 30, size: 24 },
      { type: "purple", label: "Thunder Wave", stars: 2, size: 20 },
      { type: "white", label: "Iron Tail", damage: 70, size: 12 }
    ]
  },
  charmander: {
    id: "charmander",
    name: "Charmander",
    mp: 3,
    rarity: "C",
    wheel: [
      { type: "miss", label: "Miss", size: 8 },
      { type: "white", label: "Scratch", damage: 30, size: 36 },
      { type: "white", label: "Ember", damage: 50, size: 32 },
      { type: "purple", label: "Smokescreen", stars: 1, size: 20 }
    ]
  },
  bulbasaur: {
    id: "bulbasaur",
    name: "Bulbasaur",
    mp: 3,
    rarity: "C",
    wheel: [
      { type: "miss", label: "Miss", size: 8 },
      { type: "white", label: "Vine Whip", damage: 40, size: 36 },
      { type: "purple", label: "Poison Powder", stars: 1, size: 24 },
      { type: "white", label: "Razor Leaf", damage: 60, size: 28 }
    ]
  },
  squirtle: {
    id: "squirtle",
    name: "Squirtle",
    mp: 3,
    rarity: "C",
    wheel: [
      { type: "miss", label: "Miss", size: 8 },
      { type: "blue", label: "Withdraw", size: 24 },
      { type: "white", label: "Bubble", damage: 30, size: 32 },
      { type: "white", label: "Water Gun", damage: 60, size: 32 }
    ]
  },
  eevee: {
    id: "eevee",
    name: "Eevee",
    mp: 3,
    rarity: "UC",
    wheel: [
      { type: "miss", label: "Miss", size: 8 },
      { type: "white", label: "Quick Attack", damage: 40, size: 36 },
      { type: "gold", label: "Double Kick", damage: 30, size: 24 },
      { type: "white", label: "Tackle", damage: 50, size: 28 }
    ]
  },
  mewtwo: {
    id: "mewtwo",
    name: "Mewtwo",
    mp: 2,
    rarity: "EX",
    wheel: [
      { type: "miss", label: "Miss", size: 4 },
      { type: "white", label: "Psychic", damage: 70, size: 32 },
      { type: "purple", label: "Psycho Barrier", stars: 2, size: 24 },
      { type: "white", label: "Psystrike", damage: 100, size: 28 },
      { type: "gold", label: "Confusion", damage: 50, size: 8 }
    ]
  }
};

export const STARTER_TEAM = [
  "pikachu",
  "charmander",
  "bulbasaur",
  "squirtle",
  "eevee",
  "mewtwo"
];
