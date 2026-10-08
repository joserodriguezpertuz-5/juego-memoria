/**
 * Game Configuration System
 * Designed to be easily extensible. Adding a new theme requires only adding a new entry to the themes object.
 */

const GAME_CONFIG = {
  levels: {
    facil: {
      id: 'facil',
      name: 'Fácil',
      pairs: 6,
      cols: 4
    },
    medio: {
      id: 'medio',
      name: 'Medio',
      pairs: 8,
      cols: 4
    },
    dificil: {
      id: 'dificil',
      name: 'Difícil',
      pairs: 12,
      cols: 6
    }
  },

  rules: {
    sin_limites: {
      id: 'sin_limites',
      name: 'Sin límites',
      type: 'none',
      label: 'Tiempo',
      limits: {}
    },
    contrarreloj: {
      id: 'contrarreloj',
      name: 'Contrarreloj',
      type: 'timer',
      label: 'Tiempo restante',
      limits: {
        facil: 60,
        medio: 100,
        dificil: 180
      },
      warningThreshold: 10
    },
    intentos_limitados: {
      id: 'intentos_limitados',
      name: 'Intentos limitados',
      type: 'attempts',
      label: 'Intentos restantes',
      limits: {
        facil: 12,
        medio: 20,
        dificil: 32
      },
      warningThreshold: 3
    }
  },

  themes: {
    animales: {
      id: 'animales',
      name: 'Animales',
      type: 'emoji',
      items: ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐙', '🦋', '🐢', '🦄', '🐝', '🐧']
    },
    frutas: {
      id: 'frutas',
      name: 'Frutas',
      type: 'emoji',
      items: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍍', '🥝', '🍒', '🍑', '🥭', '🍋', '🥥']
    },
    figuras: {
      id: 'figuras',
      name: 'Figuras',
      type: 'svg',
      items: [
        { name: 'Círculo', svg: `<svg viewBox="0 0 100 100" class="card-svg"><circle cx="50" cy="50" r="40" fill="#EF4444"/></svg>` },
        { name: 'Cuadrado', svg: `<svg viewBox="0 0 100 100" class="card-svg"><rect x="15" y="15" width="70" height="70" rx="10" fill="#3B82F6"/></svg>` },
        { name: 'Triángulo', svg: `<svg viewBox="0 0 100 100" class="card-svg"><polygon points="50,15 85,80 15,80" fill="#10B981"/></svg>` },
        { name: 'Estrella', svg: `<svg viewBox="0 0 100 100" class="card-svg"><polygon points="50,10 63,38 93,38 68,56 78,86 50,68 22,86 32,56 7,38 37,38" fill="#F59E0B"/></svg>` },
        { name: 'Rombo', svg: `<svg viewBox="0 0 100 100" class="card-svg"><polygon points="50,10 85,50 50,90 15,50" fill="#8B5CF6"/></svg>` },
        { name: 'Hexágono', svg: `<svg viewBox="0 0 100 100" class="card-svg"><polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="#EC4899"/></svg>` },
        { name: 'Corazón', svg: `<svg viewBox="0 0 100 100" class="card-svg"><path d="M50 85 S15 55 15 35 A 18 18 0 0 1 50 25 A 18 18 0 0 1 85 35 S85 55 50 85 Z" fill="#F43F5E"/></svg>` },
        { name: 'Cruz', svg: `<svg viewBox="0 0 100 100" class="card-svg"><path d="M35 15 H65 V35 H85 V65 H65 V85 H35 V65 H15 V35 H35 Z" fill="#06B6D4"/></svg>` },
        { name: 'Pentágono', svg: `<svg viewBox="0 0 100 100" class="card-svg"><polygon points="50,12 88,38 73,85 27,85 12,38" fill="#84CC16"/></svg>` },
        { name: 'Anillo', svg: `<svg viewBox="0 0 100 100" class="card-svg"><path d="M50 10 A40 40 0 1 0 50 90 A40 40 0 1 0 50 10 M50 30 A20 20 0 1 1 50 70 A20 20 0 1 1 50 30 Z" fill="#D946EF"/></svg>` },
        { name: 'Creciente', svg: `<svg viewBox="0 0 100 100" class="card-svg"><path d="M65 15 A35 35 0 1 0 85 75 A35 35 0 0 1 65 15 Z" fill="#6366F1"/></svg>` },
        { name: 'Gota', svg: `<svg viewBox="0 0 100 100" class="card-svg"><path d="M50 15 C30 45 20 60 20 72 A30 30 0 0 0 80 72 C80 60 70 45 50 15 Z" fill="#14B8A6"/></svg>` }
      ]
    },
    banderas: {
      id: 'banderas',
      name: 'Banderas',
      type: 'flag',
      items: [
        { code: 'co', name: 'Colombia' },
        { code: 'br', name: 'Brasil' },
        { code: 'ar', name: 'Argentina' },
        { code: 'mx', name: 'México' },
        { code: 'es', name: 'España' },
        { code: 'fr', name: 'Francia' },
        { code: 'de', name: 'Alemania' },
        { code: 'it', name: 'Italia' },
        { code: 'jp', name: 'Japón' },
        { code: 'us', name: 'Estados Unidos' },
        { code: 'gb', name: 'Reino Unido' },
        { code: 'ca', name: 'Canadá' }
      ]
    }
  }
};
