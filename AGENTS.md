# Science Companion — Content & Editorial Guidelines for AI Agents

> **Guiding Principle**: Science Companion is an illustrated, timeless digital book designed for deep, peaceful, engaging learning. It rejects noisy SaaS dashboard aesthetics in favor of thoughtful literary prose, rich historical storytelling, beautiful typographic pacing, and profound thought experiments.

---

## 1. Content Philosophy: Long-Form, Rich & Engaging

- **Never Settle for Brief Summaries**: When writing or updating chapters, biographies, discoveries, or inventions, never provide 1-2 sentence stub summaries. Readers visit this book to immerse themselves in deep, long-form narratives.
- **Story-First Pedagogy**:
  - Always anchor scientific concepts in human drama, historical struggles, quirks, and Eureka moments.
  - *Examples*:
    - **Archimedes**: Not just the formula for buoyancy, but the naked sprint through Syracuse shouting *Eureka!* to solve King Hiero's adulterated crown puzzle.
    - **Eratosthenes**: Planting a wooden stick in Alexandria on the Summer Solstice after reading about the shadowless well in Syene, calculating the planet's circumference with 1% error.
    - **Mendeleev**: Playing "chemical solitaire" on Russian trains with index cards and dreaming the Periodic Table, predicting undiscovered elements to the decimal point.
    - **Rutherford**: Firing alpha particles at gold foil and comparing the reflection to an artillery shell bouncing off tissue paper.
    - **Marie Curie**: Boiling 20-kilogram cauldrons of toxic pitchblende in a leaky shed in Paris, walking into the dark room at night to see test tubes glowing with fairy lights.
    - **Rosalind Franklin**: Spending 100 continuous hours aligning X-ray beams on DNA fibers to capture Photo 51.
- **Relatable Real-World Analogies**:
  - Break down complex formulas with intuitive thought experiments:
    - *The TV remote* for the Scientific Method and hypothesis testing.
    - *The camp fire and expanding balloon* for the Inverse-Square Law and 3D spherical dilution ($4\pi r^2$).
    - *Godzilla's snapping bones* for Galileo's Square-Cube Law (mass scaling as $r^3$ vs. bone area scaling as $r^2$).
    - *The bowling ball on a rubber trampoline* for Einstein's curved spacetime.

---

## 2. Best Reading Methodologies & Pedagogical Structure

Every chapter must follow this rhythmic, four-stage reading journey:

1. **The Provocative Hook (The Inscription & Question)**:
   - Begin with an evocative quote (Feynman, Galileo, Sagan, Curie).
   - Pose a visceral, intuitive dilemma (e.g., waking on an unknown island; listening to prime numbers on an alien radio; cutting bread in half forever).
2. **The Narrative Unfolding (History + First Principles)**:
   - Walk through the chronological human struggle to solve the dilemma.
   - Explain *how* and *why* theories were overthrown or refined. Show that being proven wrong is a triumph, not a failure.
3. **The Counter-Intuitive Revelation (The Twist)**:
   - Reveal something that shatters ordinary intuition (e.g., atoms are 99.9999999% empty space; time slows down the faster you move; plants calculate the Golden Ratio to pack seeds).
4. **Puzzles for the Curious Mind (Active Reflection)**:
   - Always conclude chapters with 3 to 4 open-ended thought experiments and riddles that invite readers to test their own reasoning rather than memorize answers.

---

## 3. Reader Engagement & Eye-Friendly Aesthetics

- **Zero Clutter, Zero Glare**:
  - No neon borders, loud floating banners, or blinking dashboard widgets.
  - Stick to calm, paper-inspired palettes:
    - **Warm Sepia Paper** (`#fdfbf7`) — primary reading mode.
    - **Clean White Linen** (`#fcfcfc`) — daylight mode.
    - **Muted Night Slate** (`#131518`) — soothing nighttime reading.
- **Editorial Typography**:
  - Primary body text: **Newsreader** serif with high line-height (`leading-[1.85]` to `leading-[1.95]`) and comfortable reading max-width (`max-w-5xl`).
  - Timeless drop caps (`book-dropcap`) at the start of major chapters.
  - Section breaks marked by floral asterisms (`❦`).
- **Audio Voice-Over & Accessibility**:
  - Full chapter audio narration (`🎧 Listen`) and per-section audio narration (`🔊 Read`) via the native browser Web Speech API.
  - Adjustable reading speeds (0.9x, 1.0x, 1.25x) and font sizing (Normal, Large, Book).

---

## 4. Visual Imagery: Classic Black & White Engravings

- **Art Direction**:
  - When adding visual illustrations, prefer **classic black-and-white etchings, pen-and-ink sketches, woodcuts, and archival monochrome diagrams** reminiscent of 19th-century scientific treatises and encyclopedias.
  - Avoid noisy, colorful stock graphics or neon 3D renders that clash with the literary book atmosphere.
  - High-contrast monochromatic illustrations maintain a tranquil, distraction-free aesthetic in Sepia, Light, and Night themes alike.
- **Placement**:
  - Place diagrams thoughtfully between narrative sections with italicized editorial captions.

---

## 5. Architectural Invariant: 100% Serverless & GitHub Pages Compatible

- The application must **always** be runnable by simply double-clicking `index.html` on any device or hosting via GitHub Pages (`https://avashtuladhar.github.io/science/`).
- **No Python or Node backend servers required**.
- All dataset updates must be synced to both:
  1. `data/science_data.json` (clean JSON standard).
  2. `data/science_data.js` (`window.SCIENCE_DATA = {...}` to guarantee zero-CORS execution under `file:///` protocols).
