import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  Flame,
  Menu,
  Moon,
  NotebookPen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

type Topic = { id: string; english: string; hindi: string; detail: string };
type Note = { id: number; title: string; body: string; createdAt: string };
type Question = { id: number; question: string; options: string[]; answer: number; hint: string };
type Stats = { sessions: number; minutes: number; mcqs: number; best: number; last: number | null };

const topics: Topic[] = [
  { id: 'article-14', english: 'Article 14', hindi: 'समानता का अधिकार', detail: 'Equality before law and equal protection of laws.' },
  { id: 'article-21', english: 'Article 21', hindi: 'जीवन और व्यक्तिगत स्वतंत्रता', detail: 'The living core of dignity and personal liberty.' },
  { id: 'article-32', english: 'Article 32', hindi: 'संवैधानिक उपचार', detail: 'The right to move the Supreme Court for remedies.' },
  { id: 'fundamental-rights', english: 'Fundamental Rights', hindi: 'मौलिक अधिकार', detail: 'Part III of the Constitution, Articles 12–35.' },
  { id: 'polity-revision', english: 'Polity Revision', hindi: 'राजव्यवस्था पुनरावृत्ति', detail: 'A quick second pass through your polity notes.' },
];

const questions: Question[] = [
  { id: 1, question: 'भारतीय संविधान का अनुच्छेद 14 किससे संबंधित है?', options: ['स्वतंत्रता का अधिकार', 'समानता का अधिकार', 'धार्मिक स्वतंत्रता', 'संवैधानिक उपचार'], answer: 1, hint: 'Think: equality before law.' },
  { id: 2, question: 'भारतीय संविधान का अनुच्छेद 21 किससे संबंधित है?', options: ['समानता का अधिकार', 'जीवन और व्यक्तिगत स्वतंत्रता', 'धार्मिक स्वतंत्रता', 'संपत्ति का अधिकार'], answer: 1, hint: 'It protects the life and liberty of every person.' },
  { id: 3, question: 'अनुच्छेद 32 किससे संबंधित है?', options: ['संवैधानिक उपचार का अधिकार', 'समानता का अधिकार', 'शिक्षा का अधिकार', 'धार्मिक स्वतंत्रता'], answer: 0, hint: 'Dr. Ambedkar called it the heart and soul.' },
  { id: 4, question: 'डॉ. बी. आर. अम्बेडकर ने किस अनुच्छेद को “heart and soul” कहा था?', options: ['अनुच्छेद 14', 'अनुच्छेद 19', 'अनुच्छेद 32', 'अनुच्छेद 21'], answer: 2, hint: 'It lets citizens approach the Supreme Court.' },
  { id: 5, question: 'मौलिक अधिकार संविधान के किस भाग में हैं?', options: ['भाग I', 'भाग II', 'भाग III', 'भाग IV'], answer: 2, hint: 'Directive Principles follow in the next part.' },
  { id: 6, question: 'अनुच्छेद 14 किस सिद्धांत से संबंधित है?', options: ['विधि के समक्ष समानता', 'धार्मिक स्वतंत्रता', 'संवैधानिक उपचार', 'शिक्षा का अधिकार'], answer: 0, hint: 'The law must see equals as equals.' },
];

const defaultNotes: Note[] = [
  { id: 1, title: 'Article 32 — the heart and soul', body: 'Dr. B. R. Ambedkar described Article 32 as the heart and soul of the Constitution. It makes Fundamental Rights enforceable through the Supreme Court.', createdAt: 'Today' },
  { id: 2, title: 'A calm revision rule', body: 'Read the article. Close the book. Explain it in two lines. Then test the edges with one question.', createdAt: 'Yesterday' },
];

const defaultStats: Stats = { sessions: 0, minutes: 0, mcqs: 0, best: 0, last: null };

function getStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span>SS</span>
      <i />
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(() => getStored('study-dark', false));
  const [mobileNav, setMobileNav] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [topicsDone, setTopicsDone] = useState<string[]>(() => getStored('study-topics', []));
  const [notes, setNotes] = useState<Note[]>(() => getStored('study-notes', defaultNotes));
  const [stats, setStats] = useState<Stats>(() => getStored('study-stats', defaultStats));
  const [seconds, setSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMessage, setTimerMessage] = useState('A small beginning is still a beginning.');
  const [noteSearch, setNoteSearch] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('study-dark', JSON.stringify(dark));
  }, [dark]);

  useEffect(() => localStorage.setItem('study-topics', JSON.stringify(topicsDone)), [topicsDone]);
  useEffect(() => localStorage.setItem('study-notes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('study-stats', JSON.stringify(stats)), [stats]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          setTimerMessage('Session complete. Five quiet minutes, well spent.');
          setStats((old) => ({ ...old, sessions: old.sessions + 1, minutes: old.minutes + 5 }));
          return 300;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    const ids = ['home', 'progress', 'timer', 'notes', 'mcq'];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0.1, 0.35, 0.7] });
    ids.forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  const topicPercent = Math.round((topicsDone.length / topics.length) * 100);
  const dailyPercent = Math.min(100, Math.round((stats.minutes / 120) * 100));
  const filteredNotes = useMemo(() => {
    const query = noteSearch.trim().toLowerCase();
    return notes.filter((note) => !query || `${note.title} ${note.body}`.toLowerCase().includes(query));
  }, [notes, noteSearch]);
  const currentQuestion = questions[quizIndex];
  const answerSelected = answers[currentQuestion.id];
  const quizPercent = quizSubmitted ? Math.round((quizScore / questions.length) * 100) : 0;

  const navigate = (id: string) => {
    setMobileNav(false);
    scrollToId(id);
  };

  const startStudying = () => {
    navigate('timer');
    setTimerRunning(true);
    setTimerMessage('Your desk is ready. Stay with the next five minutes.');
  };

  const toggleTopic = (id: string) => {
    setTopicsDone((current) => current.includes(id) ? current.filter((topicId) => topicId !== id) : [...current, id]);
  };

  const addNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteTitle.trim() || !noteBody.trim()) return;
    setNotes((current) => [{ id: Date.now(), title: noteTitle.trim(), body: noteBody.trim(), createdAt: 'Just now' }, ...current]);
    setNoteTitle('');
    setNoteBody('');
  };

  const submitQuiz = () => {
    const score = questions.reduce((total, question) => total + (answers[question.id] === question.answer ? 1 : 0), 0);
    setQuizScore(score);
    setQuizSubmitted(true);
    setStats((old) => ({ ...old, mcqs: old.mcqs + questions.length, best: Math.max(old.best, score), last: score }));
  };

  const resetQuiz = () => {
    setAnswers({});
    setQuizIndex(0);
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="study-app">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <button className="brand-button" onClick={() => navigate('home')} data-testid="button-brand" aria-label="Go to Study Space home">
            <BrandMark />
            <span className="brand-copy"><strong>Study Space</strong><small>UPSC · personal desk</small></span>
          </button>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} data-testid="button-close-navigation" aria-label="Close navigation"><X size={19} /></button>
        </div>
        <div className="side-rule" />
        <p className="eyebrow side-label">Your study room</p>
        <nav className="side-nav" aria-label="Main navigation">
          {[
            { id: 'home', label: 'Today', icon: Compass },
            { id: 'progress', label: 'My progress', icon: Target },
            { id: 'timer', label: 'Focus timer', icon: Clock3 },
            { id: 'notes', label: 'Study notes', icon: NotebookPen },
            { id: 'mcq', label: 'Practice quiz', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} className={`side-link ${activeSection === id ? 'active' : ''}`} onClick={() => navigate(id)} data-testid={`nav-${id}`}>
              <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{activeSection === id && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="quote-card">
            <Sparkles size={16} />
            <p>“The mind is not a vessel to be filled, but a fire to be kindled.”</p>
            <small>— Plutarch</small>
          </div>
          <button className="theme-toggle" onClick={() => setDark((value) => !value)} data-testid="button-theme-toggle">
            {dark ? <Sun size={17} /> : <Moon size={17} />}<span>{dark ? 'Light room' : 'Dark room'}</span><span className="toggle-track"><i className={dark ? 'on' : ''} /></span>
          </button>
        </div>
      </aside>

      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} data-testid="button-navigation-scrim" aria-label="Close navigation" />}

      <main className="main-content">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setMobileNav(true)} data-testid="button-open-navigation" aria-label="Open navigation"><Menu size={20} /></button>
          <button className="mobile-brand" onClick={() => navigate('home')} data-testid="button-mobile-brand"><BrandMark /><strong>Study Space</strong></button>
          <button className="icon-button" onClick={() => setDark((value) => !value)} data-testid="button-mobile-theme" aria-label="Toggle dark mode">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </header>

        <div className="content-wrap">
          <section id="home" className="hero-section">
            <div className="hero-topline"><span className="status-dot" /> <span>Tuesday, 18 June 2024</span><span className="topline-line" /><span>Session 01</span></div>
            <div className="hero-grid">
              <div className="hero-copy">
                <p className="eyebrow">Namaste, learner</p>
                <h1>Make room for<br /><em>one clear thought.</em></h1>
                <p className="hero-intro">यहाँ आपकी तैयारी को थोड़ी शांति मिलती है। Read less scattered. Remember more deeply.</p>
                <div className="hero-actions">
                  <button className="button button-primary" onClick={startStudying} data-testid="button-start-studying"><Play size={16} fill="currentColor" /> Start a focus session <ArrowRight size={15} /></button>
                  <button className="text-button" onClick={() => navigate('progress')} data-testid="button-view-progress">See today’s map <ArrowRight size={14} /></button>
                </div>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="sun-disc" />
                <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
                <div className="art-book"><div /><div /><div /></div>
                <span className="art-caption">अध्ययन<br /><small>quiet work, daily</small></span>
                <div className="art-stamp">01<br /><small>FOCUS</small></div>
              </div>
            </div>
            <div className="today-strip">
              <div><span className="strip-label">Today’s intention</span><strong>Understand, don’t just underline.</strong></div>
              <div className="streak"><Flame size={17} /><strong>{stats.sessions + 2} day streak</strong><span>Keep the thread alive</span></div>
              <button className="strip-arrow" onClick={() => navigate('timer')} data-testid="button-strip-timer" aria-label="Go to focus timer"><ArrowRight size={18} /></button>
            </div>
          </section>

          <section className="dashboard-section" aria-labelledby="dashboard-title">
            <div className="section-heading"><div><p className="eyebrow">A quick reading of your day</p><h2 id="dashboard-title">The desk, at a glance</h2></div><span className="section-number">01 / 05</span></div>
            <div className="metric-grid">
              <div className="metric-card metric-feature"><div className="metric-icon warm"><Clock3 size={18} /></div><span>Study sessions</span><strong data-testid="text-dashboard-sessions">{stats.sessions}</strong><small>completed in this space</small></div>
              <div className="metric-card"><div className="metric-icon teal"><Zap size={18} /></div><span>Study time</span><strong data-testid="text-dashboard-time">{stats.minutes}<b> min</b></strong><small>of 120 min daily goal</small><div className="mini-progress"><i style={{ width: `${dailyPercent}%` }} /></div></div>
              <div className="metric-card"><div className="metric-icon plum"><Trophy size={18} /></div><span>Best quiz score</span><strong data-testid="text-dashboard-best">{stats.best}<b> / 6</b></strong><small>{stats.last === null ? 'No quiz attempted yet' : `Last attempt: ${stats.last} / 6`}</small></div>
              <div className="metric-card metric-goal"><div className="goal-ring" style={{ '--progress': `${dailyPercent * 3.6}deg` } as React.CSSProperties}><span>{dailyPercent}<small>%</small></span></div><div><span>Daily goal</span><strong>{stats.minutes >= 120 ? 'Complete' : `${Math.max(0, 120 - stats.minutes)} min left`}</strong><small>Two hours, in small pieces.</small></div></div>
            </div>
          </section>

          <section id="progress" className="workspace-section progress-section" aria-labelledby="progress-title">
            <div className="section-heading"><div><p className="eyebrow">Polity · Fundamental Rights</p><h2 id="progress-title">Keep your place</h2></div><span className="section-number">02 / 05</span></div>
            <div className="progress-layout">
              <div className="progress-overview"><div className="big-progress-number">{topicPercent}<span>%</span></div><p>of today’s constitutional reading is in your long-term memory.</p><div className="line-progress"><i style={{ width: `${topicPercent}%` }} /></div><div className="progress-meta"><span>{topicsDone.length} topics checked</span><span>{topics.length - topicsDone.length} to revisit</span></div><div className="progress-note"><CheckCircle2 size={16} /><span>Small checkmarks compound into confidence.</span></div></div>
              <div className="topic-list" data-testid="list-topics">{topics.map((topic) => {
                const done = topicsDone.includes(topic.id);
                return <button key={topic.id} className={`topic-row ${done ? 'done' : ''}`} onClick={() => toggleTopic(topic.id)} data-testid={`topic-${topic.id}`} aria-pressed={done}><span className="topic-check">{done && <Check size={14} strokeWidth={3} />}</span><span className="topic-label"><strong>{topic.english}</strong><span>{topic.hindi}</span></span><span className="topic-detail">{topic.detail}</span><ArrowRight size={15} className="topic-arrow" /></button>;
              })}</div>
            </div>
          </section>

          <section id="timer" className="workspace-section timer-section" aria-labelledby="timer-title">
            <div className="section-heading"><div><p className="eyebrow">Focus room</p><h2 id="timer-title">Five minutes, fully yours.</h2></div><span className="section-number">03 / 05</span></div>
            <div className="timer-panel">
              <div className="timer-side"><span className={`pulse ${timerRunning ? 'running' : ''}`} /><span>{timerRunning ? 'In session' : 'Ready when you are'}</span><p>Put the phone down. Follow the next sentence.</p></div>
              <div className={`timer-clock ${timerRunning ? 'is-running' : ''}`} data-testid="text-timer">{formatTime(seconds)}</div>
              <div className="timer-actions"><button className="button button-primary" onClick={() => { setTimerRunning(true); setTimerMessage('The only task is to stay here.'); }} disabled={timerRunning} data-testid="button-timer-start"><Play size={15} fill="currentColor" /> Start</button><button className="button button-quiet" onClick={() => { setTimerRunning(false); setTimerMessage('Paused. Your place is safe.'); }} disabled={!timerRunning} data-testid="button-timer-pause"><Pause size={15} /> Pause</button><button className="icon-button timer-reset" onClick={() => { setTimerRunning(false); setSeconds(300); setTimerMessage('A small beginning is still a beginning.'); }} data-testid="button-timer-reset" aria-label="Reset timer"><RotateCcw size={17} /></button></div>
              <p className="timer-message" data-testid="status-timer">{timerMessage}</p>
            </div>
          </section>

          <section id="notes" className="workspace-section notes-section" aria-labelledby="notes-title">
            <div className="section-heading"><div><p className="eyebrow">Your second brain</p><h2 id="notes-title">Notes worth returning to.</h2></div><span className="section-number">04 / 05</span></div>
            <div className="notes-layout">
              <form className="note-form" onSubmit={addNote}>
                <div className="note-form-heading"><NotebookPen size={19} /><span>New note</span><small>Saved locally</small></div>
                <label><span>Title</span><input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="e.g. Article 21 in one line" data-testid="input-note-title" /></label>
                <label><span>Your thought</span><textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} placeholder="Write the idea in your own words..." rows={6} data-testid="input-note-body" /></label>
                <button className="button button-primary note-submit" type="submit" data-testid="button-add-note"><Plus size={16} /> Add note</button>
              </form>
              <div className="notes-library">
                <div className="library-top"><div><span className="eyebrow">Library <b>{notes.length}</b></span><strong>Recent fragments</strong></div><label className="search-field"><Search size={16} /><input type="search" value={noteSearch} onChange={(event) => setNoteSearch(event.target.value)} placeholder="Search your notes" data-testid="input-note-search" /></label></div>
                {filteredNotes.length === 0 ? <div className="empty-state"><FileText size={26} /><strong>No notes found</strong><p>Try another phrase, or make a new note on the left.</p></div> : <div className="notes-list">{filteredNotes.map((note) => <article className="note-card" key={note.id} data-testid={`card-note-${note.id}`}><div className="note-card-top"><span>{note.createdAt}</span><button className="delete-button" onClick={() => setNotes((current) => current.filter((item) => item.id !== note.id))} data-testid={`button-delete-note-${note.id}`} aria-label={`Delete ${note.title}`}><Trash2 size={15} /></button></div><h3>{note.title}</h3><p>{note.body}</p></article>)}</div>}
              </div>
            </div>
          </section>

          <section id="mcq" className="workspace-section quiz-section" aria-labelledby="quiz-title">
            <div className="section-heading"><div><p className="eyebrow">UPSC polity · quick check</p><h2 id="quiz-title">Test the edges of memory.</h2></div><span className="section-number">05 / 05</span></div>
            {!quizSubmitted ? <div className="quiz-wrap"><div className="quiz-progress-top"><span>Fundamental Rights</span><strong>0{quizIndex + 1} <i>/ 06</i></strong></div><div className="quiz-progress"><i style={{ width: `${((quizIndex + 1) / questions.length) * 100}%` }} /></div><div className="quiz-question"><span className="question-kicker">Question {quizIndex + 1}</span><h3>{currentQuestion.question}</h3><div className="options">{currentQuestion.options.map((option, index) => <label key={option} className={`option ${answerSelected === index ? 'selected' : ''}`}><input type="radio" name={`question-${currentQuestion.id}`} checked={answerSelected === index} onChange={() => setAnswers((old) => ({ ...old, [currentQuestion.id]: index }))} data-testid={`radio-answer-${currentQuestion.id}-${index}`} /><span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{answerSelected === index && <Check size={16} />}</label>)}</div><p className="quiz-hint"><Sparkles size={14} /> {currentQuestion.hint}</p></div><div className="quiz-nav"><button className="button button-quiet" onClick={() => setQuizIndex((value) => Math.max(0, value - 1))} disabled={quizIndex === 0} data-testid="button-quiz-previous"><ChevronLeft size={16} /> Previous</button>{quizIndex === questions.length - 1 ? <button className="button button-primary" onClick={submitQuiz} data-testid="button-quiz-submit">Submit answers <Check size={16} /></button> : <button className="button button-primary" onClick={() => setQuizIndex((value) => Math.min(questions.length - 1, value + 1))} data-testid="button-quiz-next">Next question <ChevronRight size={16} /></button>}</div></div> : <div className="quiz-result"><div className="result-medal"><Trophy size={28} /></div><p className="eyebrow">Your result</p><h3>{quizScore === questions.length ? 'A clear, confident read.' : quizScore >= 4 ? 'Good work. Keep the thread.' : 'The gaps are useful. Revisit and return.'}</h3><div className="result-score"><strong>{quizScore}</strong><span>/ {questions.length}<small>correct answers</small></span></div><div className="result-bar"><i style={{ width: `${quizPercent}%` }} /></div><p className="result-copy">You answered {quizScore} of {questions.length} questions correctly. Every attempt gives the next revision a sharper edge.</p><button className="button button-primary" onClick={resetQuiz} data-testid="button-quiz-retry"><RotateCcw size={15} /> Try again</button></div>}
          </section>
          <footer><BrandMark /><span>Study Space · एक कदम हर दिन</span><span className="footer-line" /><span>Built for the long read.</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;