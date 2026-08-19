
export const PARCHMENT_THEMES = {
  fantasy: {
    bgImage: '/templates/bg-fantasy.png',
    fontFamily: '"MedievalSharp", cursive, serif',
    textColor: '#3b0764',
    titleColor: '#3b0764',
    quoteBg: 'rgba(216, 180, 254, 0.4)',
    tableBg: '#c084fc',
    tableBorder: '#6b21a8',
  },
  scifi: {
    bgImage: '/templates/bg-scifi.png',
    fontFamily: '"Courier New", monospace',
    textColor: '#e0f2fe',
    titleColor: '#ffffff', // Koyu temada net beyaz başlık 🤍
    quoteBg: 'rgba(163, 177, 138, 0.5)',
    tableBg: '#a3b18a',
    tableBorder: '#344e41',
  },
  gothic: {
    bgImage: '/templates/bg-gothic.png',
    fontFamily: '"Cinzel Decorative", serif',
    textColor: '#fef08a',
    titleColor: '#ffffff', // Horror/Gothic için net beyaz başlık 🤍
    quoteBg: 'rgba(248, 113, 113, 0.3)',
    tableBg: '#f87171',
    tableBorder: '#991b1b',
  },
  romance: {
    bgImage: '/templates/bg-romance.png',
    fontFamily: '"Tangerine", cursive, serif',
    textColor: '#291e10',
    titleColor: '#291e10',
    quoteBg: 'rgba(217, 119, 6, 0.35)',
    tableBg: '#9a3412',
    tableBorder: '#431407',
  }
};

export const getThemeByGenre = (genre) => {
  if (!genre) return PARCHMENT_THEMES.romance;
  const g = genre.toLowerCase().trim();

  if (['fantasy', 'ya', 'young adult', 'adventure'].includes(g)) {
    return PARCHMENT_THEMES.fantasy;
  }
  if (['sci-fi', 'scifi', 'dystopian'].includes(g)) {
    return PARCHMENT_THEMES.scifi;
  }
  if (['gothic', 'horror', 'thriller', 'mystery', 'gothic / thriller'].includes(g)) {
    return PARCHMENT_THEMES.gothic;
  }
  
  return PARCHMENT_THEMES.romance;
};