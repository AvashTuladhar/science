function scienceApp() {
  return {
    // Reading Theme: 'sepia' (warm book paper), 'light' (clean white), 'night' (calm dark slate)
    theme: localStorage.getItem('sc_book_theme') || 'sepia',
    
    // Active chapter selection
    selectedChapterId: 'ch1',
    
    // Visual toggles for distraction-free reading
    activeView: 'book', // 'book', 'giants', 'nobel', 'inventions', 'quiz'
    fontSizeIndex: 1, // 0: standard, 1: comfortable (19px), 2: large book (22px)
    fontSizes: ['text-base leading-relaxed', 'text-[19px] leading-[1.85]', 'text-[22px] leading-[1.95]'],
    
    // Chapter sidebar drawer
    drawerOpen: false,
    
    // Modal state for scientist biography
    selectedScientist: null,
    
    // Search / Filter inside compendium
    searchQuery: '',
    scientistFilter: 'all',
    
    // Data store loaded immediately from window.SCIENCE_DATA or fallback fetch
    data: (window.SCIENCE_DATA && window.SCIENCE_DATA.chapters) ? window.SCIENCE_DATA : {
      chapters: [],
      scientists: [],
      nobelPrizes: [],
      inventions: [],
      discoveries: [],
      puzzles: []
    },

    async initApp() {
      if (!this.data.chapters || this.data.chapters.length === 0) {
        try {
          const res = await fetch('data/science_data.json');
          if (res.ok) this.data = await res.json();
        } catch (e) {
          console.warn('Using fallback data:', e);
        }
      }
    },

    setTheme(newTheme) {
      this.theme = newTheme;
      localStorage.setItem('sc_book_theme', newTheme);
    },

    cycleFontSize() {
      this.fontSizeIndex = (this.fontSizeIndex + 1) % this.fontSizes.length;
    },

    get currentFontSizeClass() {
      return this.fontSizes[this.fontSizeIndex];
    },

    get currentChapter() {
      if (!this.data.chapters || this.data.chapters.length === 0) return null;
      return this.data.chapters.find(c => c.id === this.selectedChapterId) || this.data.chapters[0];
    },

    selectChapter(chapterId) {
      this.selectedChapterId = chapterId;
      this.activeView = 'book';
      this.drawerOpen = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    openScientist(s) {
      this.selectedScientist = s;
    },

    get filteredScientists() {
      let list = this.data.scientists || [];
      const q = this.searchQuery.toLowerCase().trim();
      if (q) {
        list = list.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.majorDiscovery.toLowerCase().includes(q) ||
          (s.fields && s.fields.some(f => f.toLowerCase().includes(q)))
        );
      }
      if (this.scientistFilter !== 'all') {
        list = list.filter(s => s.fields && s.fields.some(f => f.toLowerCase().includes(this.scientistFilter.toLowerCase())));
      }
      return list;
    }
  };
}
