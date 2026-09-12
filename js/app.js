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
      this.initSpeech();
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

    get previousChapter() {
      if (!this.data.chapters || this.data.chapters.length === 0) return null;
      const idx = this.data.chapters.findIndex(c => c.id === this.selectedChapterId);
      return idx > 0 ? this.data.chapters[idx - 1] : null;
    },

    get nextChapter() {
      if (!this.data.chapters || this.data.chapters.length === 0) return null;
      const idx = this.data.chapters.findIndex(c => c.id === this.selectedChapterId);
      return (idx >= 0 && idx < this.data.chapters.length - 1) ? this.data.chapters[idx + 1] : null;
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

    // ==========================================
    // AUDIO VOICE OVER / NARRATOR (Web Speech API)
    // ==========================================
    isNarrating: false,
    isPaused: false,
    currentNarratingSection: null,
    speechRate: 1.0, // 0.85, 1.0, 1.2
    synth: ('speechSynthesis' in window) ? window.speechSynthesis : null,
    availableVoices: [],
    selectedVoice: null,

    initSpeech() {
      if (!this.synth) return;
      const loadVoices = () => {
        const voices = this.synth.getVoices();
        if (voices.length > 0) {
          this.availableVoices = voices.filter(v => v.lang.startsWith('en'));
          // Prefer natural/enhanced English voices if available (e.g. Samantha, Daniel, Google, Natural)
          this.selectedVoice = this.availableVoices.find(v => 
            v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Samantha') || v.name.includes('Daniel')
          ) || this.availableVoices[0] || voices[0];
        }
      };
      loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = loadVoices;
      }
    },

    toggleNarrateSection(sec) {
      if (!this.synth) {
        alert('Your browser does not support text-to-speech audio.');
        return;
      }

      if (this.isNarrating && this.currentNarratingSection === sec.id) {
        this.stopNarration();
        return;
      }

      this.stopNarration();
      this.currentNarratingSection = sec.id;
      this.isNarrating = true;
      this.isPaused = false;

      // Clean text for natural reading flow
      const textToRead = sec.title + '. ' + (sec.subtitle ? sec.subtitle + '. ' : '') + sec.paragraphs.join(' ');
      const utterance = new SpeechSynthesisUtterance(textToRead);
      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.rate = this.speechRate;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.isNarrating = false;
        this.isPaused = false;
        this.currentNarratingSection = null;
      };

      utterance.onerror = () => {
        this.isNarrating = false;
        this.isPaused = false;
        this.currentNarratingSection = null;
      };

      this.synth.speak(utterance);
    },

    toggleNarrateChapter() {
      if (!this.synth) {
        alert('Your browser does not support text-to-speech audio.');
        return;
      }

      if (this.isNarrating && this.currentNarratingSection === 'entire_chapter') {
        this.stopNarration();
        return;
      }

      this.stopNarration();
      const ch = this.currentChapter;
      if (!ch || !ch.bookSections) return;

      this.currentNarratingSection = 'entire_chapter';
      this.isNarrating = true;
      this.isPaused = false;

      let fullText = 'Chapter ' + ch.number + ': ' + ch.title + '. ' + (ch.subtitle || '') + '. ';
      ch.bookSections.forEach(sec => {
        fullText += sec.title + '. ' + sec.paragraphs.join(' ') + ' ';
      });

      const utterance = new SpeechSynthesisUtterance(fullText);
      if (this.selectedVoice) utterance.voice = this.selectedVoice;
      utterance.rate = this.speechRate;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        this.isNarrating = false;
        this.isPaused = false;
        this.currentNarratingSection = null;
      };

      utterance.onerror = () => {
        this.isNarrating = false;
        this.isPaused = false;
        this.currentNarratingSection = null;
      };

      this.synth.speak(utterance);
    },

    pauseResumeNarration() {
      if (!this.synth) return;
      if (this.synth.paused) {
        this.synth.resume();
        this.isPaused = false;
      } else if (this.synth.speaking) {
        this.synth.pause();
        this.isPaused = true;
      }
    },

    stopNarration() {
      if (this.synth) {
        this.synth.cancel();
      }
      this.isNarrating = false;
      this.isPaused = false;
      this.currentNarratingSection = null;
    },

    cycleSpeechRate() {
      const rates = [0.9, 1.0, 1.25];
      const nextIdx = (rates.indexOf(this.speechRate) + 1) % rates.length;
      this.speechRate = rates[nextIdx];
      // If currently narrating, restart with new rate
      if (this.isNarrating) {
        const activeId = this.currentNarratingSection;
        if (activeId === 'entire_chapter') {
          this.toggleNarrateChapter();
        } else {
          const sec = (this.currentChapter?.bookSections || []).find(s => s.id === activeId);
          if (sec) this.toggleNarrateSection(sec);
        }
      }
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
