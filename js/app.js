function scienceApp() {
  return {
    // Reading Theme: 'sepia' (warm book paper), 'light' (clean white), 'night' (calm dark slate)
    theme: localStorage.getItem('sc_book_theme') || 'sepia',
    
    // Active chapter selection & lazy loading cache
    selectedChapterId: 'ch1',
    loadedChapters: {},
    isLoadingChapter: false,
    
    // Visual views: 'book' (chapters), 'giants' (pioneers), 'nobel' (archive), 'inventions' (discoveries & tools)
    activeView: 'book',
    fontSizeIndex: 1, // 0: standard, 1: comfortable (19px), 2: large book (22px)
    fontSizes: ['text-base leading-relaxed', 'text-[19px] leading-[1.85]', 'text-[22px] leading-[1.95]'],
    
    // Chapter sidebar drawer
    drawerOpen: false,
    
    // =========================================================================
    // PIONEERS TIMELINE & DEEP READER STATE
    // =========================================================================
    selectedScientistId: 'archimedes',
    pioneerTimelineFilter: 'all', // 'all', 'ancient', 'medieval', 'renaissance', 'enlightenment', 'industrial', 'modern', 'contemporary'
    pioneerViewMode: 'story', // 'story' (timeline + deep reading) or 'gallery' (compact cards index)
    searchQuery: '',
    scientistFilter: 'all',

    // =========================================================================
    // DISCOVERIES & INVENTIONS TIMELINE STATE
    // =========================================================================
    selectedMilestoneId: 'disc_fire',
    milestoneTimelineFilter: 'all', // 'all', 'discovery', 'invention'
    milestoneViewMode: 'story', // 'story' (timeline + deep reading) or 'catalog' (compact list)
    milestoneSearchQuery: '',
    
    // Data store loaded immediately from window.SCIENCE_MANIFEST / window.SCIENCE_DATA
    data: {
      chapters: (window.SCIENCE_MANIFEST && window.SCIENCE_MANIFEST.chapters) ? 
        window.SCIENCE_MANIFEST.chapters : 
        (window.SCIENCE_DATA && window.SCIENCE_DATA.chapters) ? window.SCIENCE_DATA.chapters : [],
      scientists: (window.SCIENCE_DATA && window.SCIENCE_DATA.scientists) || [],
      nobelPrizes: (window.SCIENCE_DATA && window.SCIENCE_DATA.nobelPrizes) || [],
      inventions: (window.SCIENCE_DATA && window.SCIENCE_DATA.inventions) || [],
      discoveries: (window.SCIENCE_DATA && window.SCIENCE_DATA.discoveries) || [],
      puzzles: (window.SCIENCE_DATA && window.SCIENCE_DATA.puzzles) || []
    },

    async initApp() {
      // Seed preloaded chapters if already in window (e.g. ch1 or monolithic fallback)
      if (window.SCIENCE_CHAPTER_CH1) {
        this.loadedChapters['ch1'] = window.SCIENCE_CHAPTER_CH1;
      }
      if (window.SCIENCE_DATA && window.SCIENCE_DATA.chapters) {
        window.SCIENCE_DATA.chapters.forEach(ch => {
          if (ch.bookSections && ch.bookSections.length > 0) {
            this.loadedChapters[ch.id] = ch;
          }
        });
      }

      // Fetch fallback if running in server environment without preloaded global variables
      if (!this.data.chapters || this.data.chapters.length === 0) {
        try {
          const res = await fetch('data/manifest.json');
          if (res.ok) {
            const manifest = await res.json();
            this.data.chapters = manifest.chapters;
          } else {
            const dataRes = await fetch('data/science_data.json');
            if (dataRes.ok) this.data = await dataRes.json();
          }
        } catch (e) {
          console.warn('Using fallback data fetch:', e);
        }
      }

      // Ensure initial chapter is loaded
      await this.loadChapter(this.selectedChapterId);
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
      if (this.loadedChapters[this.selectedChapterId]) {
        return this.loadedChapters[this.selectedChapterId];
      }
      const globalKey = 'SCIENCE_CHAPTER_' + this.selectedChapterId.toUpperCase();
      if (window[globalKey]) {
        this.loadedChapters[this.selectedChapterId] = window[globalKey];
        return this.loadedChapters[this.selectedChapterId];
      }
      if (this.data.chapters && this.data.chapters.length > 0) {
        return this.data.chapters.find(c => c.id === this.selectedChapterId) || this.data.chapters[0];
      }
      return null;
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

    async selectChapter(chapterId) {
      this.selectedChapterId = chapterId;
      this.activeView = 'book';
      this.drawerOpen = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await this.loadChapter(chapterId);
    },

    async loadChapter(chapterId) {
      if (this.loadedChapters[chapterId] && this.loadedChapters[chapterId].bookSections) {
        return this.loadedChapters[chapterId];
      }

      const globalKey = 'SCIENCE_CHAPTER_' + chapterId.toUpperCase();
      if (window[globalKey]) {
        this.loadedChapters[chapterId] = window[globalKey];
        return this.loadedChapters[chapterId];
      }

      this.isLoadingChapter = true;
      try {
        // Zero-CORS script injection pattern (works on file:/// protocols as well as GitHub Pages)
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = `data/chapters/${chapterId}.js`;
          script.onload = () => {
            if (window[globalKey]) {
              this.loadedChapters[chapterId] = window[globalKey];
            }
            resolve();
          };
          script.onerror = async () => {
            // Fallback for HTTP environments using JSON fetch
            try {
              const res = await fetch(`data/chapters/${chapterId}.json`);
              if (res.ok) {
                this.loadedChapters[chapterId] = await res.json();
              }
            } catch (err) {
              console.warn(`Could not load chapter ${chapterId}:`, err);
            }
            resolve();
          };
          document.head.appendChild(script);
        });
      } finally {
        this.isLoadingChapter = false;
      }

      return this.loadedChapters[chapterId] || null;
    },

    // =========================================================================
    // PIONEERS LOGIC & COMPUTED PROPERTIES
    // =========================================================================
    get pioneerTimelineList() {
      const list = (this.data.scientists || []).slice();
      return list.sort((a, b) => (a.sortYear || 0) - (b.sortYear || 0));
    },

    get filteredScientists() {
      let list = this.pioneerTimelineList;
      const q = this.searchQuery.toLowerCase().trim();
      if (q) {
        list = list.filter(s =>
          s.name.toLowerCase().includes(q) ||
          (s.country && s.country.toLowerCase().includes(q)) ||
          (s.majorDiscovery && s.majorDiscovery.toLowerCase().includes(q)) ||
          (s.fields && s.fields.some(f => f.toLowerCase().includes(q)))
        );
      }
      if (this.scientistFilter !== 'all') {
        list = list.filter(s => s.fields && s.fields.some(f => f.toLowerCase().includes(this.scientistFilter.toLowerCase())));
      }
      if (this.pioneerTimelineFilter !== 'all') {
        list = list.filter(s => s.periodGroup === this.pioneerTimelineFilter);
      }
      return list;
    },

    get selectedScientist() {
      const scientists = this.data.scientists || [];
      if (scientists.length === 0) return null;
      const found = scientists.find(s => s.id === this.selectedScientistId);
      return found || scientists[0];
    },

    selectScientist(id) {
      this.selectedScientistId = id;
      this.pioneerViewMode = 'story';
      const el = document.getElementById('pioneer-reader-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    selectPreviousScientist() {
      const list = this.pioneerTimelineList;
      const idx = list.findIndex(s => s.id === this.selectedScientistId);
      if (idx > 0) {
        this.selectScientist(list[idx - 1].id);
      }
    },

    selectNextScientist() {
      const list = this.pioneerTimelineList;
      const idx = list.findIndex(s => s.id === this.selectedScientistId);
      if (idx >= 0 && idx < list.length - 1) {
        this.selectScientist(list[idx + 1].id);
      }
    },

    // =========================================================================
    // DISCOVERIES & INVENTIONS LOGIC
    // =========================================================================
    get allMilestones() {
      const discs = (this.data.discoveries || []).map(d => ({
        ...d,
        itemType: 'discovery',
        typeLabel: 'Fundamental Discovery'
      }));
      const invs = (this.data.inventions || []).map(i => ({
        ...i,
        itemType: 'invention',
        typeLabel: 'Epoch-Making Tool'
      }));
      const combined = [...discs, ...invs];
      return combined.sort((a, b) => (a.sortYear || 0) - (b.sortYear || 0));
    },

    get filteredMilestones() {
      let list = this.allMilestones;
      if (this.milestoneTimelineFilter === 'discovery') {
        list = list.filter(m => m.itemType === 'discovery');
      } else if (this.milestoneTimelineFilter === 'invention') {
        list = list.filter(m => m.itemType === 'invention');
      }
      const q = this.milestoneSearchQuery.toLowerCase().trim();
      if (q) {
        list = list.filter(m =>
          m.name.toLowerCase().includes(q) ||
          (m.creator && m.creator.toLowerCase().includes(q)) ||
          (m.field && m.field.toLowerCase().includes(q)) ||
          (m.category && m.category.toLowerCase().includes(q))
        );
      }
      return list;
    },

    get selectedMilestone() {
      const list = this.allMilestones;
      if (list.length === 0) return null;
      const found = list.find(m => m.id === this.selectedMilestoneId);
      return found || list[0];
    },

    selectMilestone(id) {
      this.selectedMilestoneId = id;
      this.milestoneViewMode = 'story';
      const el = document.getElementById('milestone-reader-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    selectPreviousMilestone() {
      const list = this.allMilestones;
      const idx = list.findIndex(m => m.id === this.selectedMilestoneId);
      if (idx > 0) {
        this.selectMilestone(list[idx - 1].id);
      }
    },

    selectNextMilestone() {
      const list = this.allMilestones;
      const idx = list.findIndex(m => m.id === this.selectedMilestoneId);
      if (idx >= 0 && idx < list.length - 1) {
        this.selectMilestone(list[idx + 1].id);
      }
    },

    // =========================================================================
    // AUDIO VOICE OVER / NARRATOR (Web Speech API)
    // =========================================================================
    isNarrating: false,
    isPaused: false,
    currentNarratingSection: null,
    speechRate: 1.0,
    synth: ('speechSynthesis' in window) ? window.speechSynthesis : null,
    availableVoices: [],
    selectedVoice: null,

    initSpeech() {
      if (!this.synth) return;
      const loadVoices = () => {
        const voices = this.synth.getVoices();
        if (voices.length > 0) {
          this.availableVoices = voices.filter(v => v.lang.startsWith('en'));
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

    toggleNarrateScientist(s) {
      if (!this.synth) {
        alert('Your browser does not support text-to-speech audio.');
        return;
      }

      const key = 'scientist_' + s.id;
      if (this.isNarrating && this.currentNarratingSection === key) {
        this.stopNarration();
        return;
      }

      this.stopNarration();
      this.currentNarratingSection = key;
      this.isNarrating = true;
      this.isPaused = false;

      const storyText = s.name + ', ' + s.era + '. ' +
        'The Wellspring of Curiosity: ' + (s.curiosityStory || s.details) + ' ' +
        'The Moment of Inspiration: ' + (s.inspirationMoment || '') + ' ' +
        'How It Was Done: ' + (s.howTheyDidIt || '') + ' ' +
        'The Lasting Wonder: ' + (s.fascinatingImpact || '');

      const utterance = new SpeechSynthesisUtterance(storyText);
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

    toggleNarrateMilestone(m) {
      if (!this.synth) {
        alert('Your browser does not support text-to-speech audio.');
        return;
      }

      const key = 'milestone_' + m.id;
      if (this.isNarrating && this.currentNarratingSection === key) {
        this.stopNarration();
        return;
      }

      this.stopNarration();
      this.currentNarratingSection = key;
      this.isNarrating = true;
      this.isPaused = false;

      const textToRead = m.name + ', ' + (m.yearDisplay || m.period || m.year) + '. ' +
        'The World Before: ' + (m.theWorldBefore || '') + ' ' +
        'The Curious Spark: ' + (m.curiositySpark || '') + ' ' +
        'How It Works: ' + (m.howItWorks || '') + ' ' +
        'The Civilizational Leap: ' + (m.civilizationalLeap || m.impact || m.significance || '');

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
      if (this.isNarrating) {
        const activeId = this.currentNarratingSection;
        if (activeId === 'entire_chapter') {
          this.toggleNarrateChapter();
        } else if (activeId && activeId.startsWith('scientist_')) {
          if (this.selectedScientist) this.toggleNarrateScientist(this.selectedScientist);
        } else if (activeId && activeId.startsWith('milestone_')) {
          if (this.selectedMilestone) this.toggleNarrateMilestone(this.selectedMilestone);
        } else {
          const sec = (this.currentChapter?.bookSections || []).find(s => s.id === activeId);
          if (sec) this.toggleNarrateSection(sec);
        }
      }
    }
  };
}
