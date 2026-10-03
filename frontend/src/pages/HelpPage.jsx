import React, { useState } from 'react'
import useAuthStore from '../stores/authStore'
import useIsMobile from '../hooks/useIsMobile'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import ProfileDropdown from '../components/ProfileDropdown'

// Role-aware in-app manual. Reached from the sidebar "Manual" item (/teacher/help, /student/help).
const TEACHER_SECTIONS = [
  {
    icon: '🚀', title: 'Getting started', ordered: true,
    body: [
      'Create a room from the Dashboard (quick-create) or the Create Room page.',
      'Give it a name and choose a mode — Normal (microphone) or Video (YouTube / live stream).',
      'Open Settings and adjust the room to how you want to run it (see "Room settings" below) before you begin.',
      'Share the room\'s join code with your students so they can join.',
      'Run the session, launching questions as you go. Click "End Room" when you are finished — this closes all polls and shows the final leaderboard.',
    ],
  },
  {
    icon: '⚙️', title: 'Room settings (the "Settings" button)',
    body: [
      'Segment Time — how long each lecture/video segment runs before questions are generated from it (choose 1, 2, 3, 5, 10, 15, 20 or 30 min; default 2). Shorter segments = more frequent polls.',
      'Questions / Segment — how many questions to generate each segment (1 to 10; default 2).',
      'Difficulty Level — easy, medium, or hard; controls how challenging the generated questions are (default medium).',
      'Question Type Mix — the percentage split across MCQ (one correct answer), True/False, and MSQ (multiple correct answers). The three must add up to 100% (default: 100% True/False).',
      'Time to Answer (TTA) — how many seconds students get to answer each poll (0 to 300; default 30).',
      'Points per Question — the maximum points for a correct answer (1 to 500; default 100). Faster correct answers earn more (points decay with time).',
      'Question Provider — the AI engine used to generate questions (a default is preselected).',
      'Tip: set these before you start. You can reopen Settings any time; changes apply to the questions generated after that.',
    ],
  },
  {
    icon: '🎙️', title: 'Normal mode (microphone)', ordered: true,
    body: [
      'Click the microphone to start; the room transcribes your lecture in real time (watch it fill in the "Current Segment Transcription" panel).',
      'At the end of each segment the app auto-generates questions from what you said, using your Settings (count, difficulty, type mix).',
      'Review and approve the questions in the popup, then launch them as a live poll.',
      'You can also press "Generate Q" on the transcript panel to generate from the current segment without waiting for the timer.',
    ],
  },
  {
    icon: '🎬', title: 'Video mode (YouTube / live stream)', ordered: true,
    body: [
      'Create the room in Video mode and paste a YouTube video or live-stream link — or change it later with "Edit link" on the room page.',
      'Click "Start Session" and, when the browser asks, share THIS tab and tick "Share tab audio". That lets Spandan hear the video to transcribe it and generate questions. The prompt appears once per session (browsers never allow silent capture).',
      'Play the video — it transcribes and generates questions per segment, exactly like the mic does.',
      'The video pauses automatically while a poll is live and resumes afterwards (live streams jump back to the live edge). Use Chrome or Edge for the most reliable tab-audio sharing.',
    ],
  },
  {
    icon: '📋', title: 'Paste & Generate (from your own text)',
    body: [
      'Use "Paste & Generate" to create questions from text you already have — lecture notes, a textbook passage, an article — without lecturing live.',
      'Click Paste & Generate and paste your content (at least 50 characters).',
      'Choose a style: "True/False" (T/F questions only) or "Mixed" (a variety of question types).',
      'The AI generates questions using your room\'s difficulty and count settings; review and edit them in the approval popup, then launch.',
    ],
  },
  {
    icon: '✍️', title: 'Create Q (write your own question)', ordered: true,
    body: [
      'Use "Create Q" when you want full control and no AI — you write the question yourself.',
      'Pick a type: MCQ (one correct of several options), True/False, or MSQ (several correct options).',
      'Type the question and its options, mark the correct answer(s), and set the points.',
      'Launch it straight to students with the answer timer.',
    ],
  },
  {
    icon: '❓', title: 'Running a poll & the leaderboard', ordered: true,
    body: [
      'Questions reach students from three places: auto-generated per segment, Paste & Generate, or Create Q.',
      'Review and approve each question in the popup — edit the wording or the correct answer if needed.',
      'Launch it. Students see the question and answer within the Time to Answer you set.',
      'Watch answers arrive; the leaderboard ranks students by points (correctness + speed).',
      'Continue to the next question or segment. When done, "End Room" settles and shows the final leaderboard.',
    ],
  },
]

const STUDENT_SECTIONS = [
  {
    icon: '🔗', title: 'How do I join a room?',
    body: [
      'You’ll receive the room’s hexacode through Samagama Announcements or the WhatsApp VicharanaShala channel.',
      'On your Dashboard, paste the code into Quick Join and click the Join Room button.',
    ],
  },
  {
    icon: '❓', title: 'What happens after I join?',
    body: [
      'The YouTube video or live stream will play.',
      'Listen to the session and wait for your teacher to launch a poll.',
      'Polls are launched by the teacher at a fixed interval of 10–12 minutes.',
    ],
  },
  {
    icon: '✅', title: 'How do I answer a poll?',
    body: [
      'When your teacher launches a poll, the question appears on your screen.',
      'Choose your answer and select Submit before the timer runs out.',
      'For multiple-select questions, select all the correct options.',
      'Correct answers earn points, and faster answers earn more points. Incorrect answers earn no points.',
      'When the poll closes, the question disappears.',
    ],
  },
  {
    icon: '⏱️', title: 'How do I know when a poll will appear?',
    body: [
      'In video mode, the video pauses automatically while a poll is active, and the question appears in its place.',
      'If you see a poll, answer it without refreshing the page.',
      'Refreshing does not restore an active poll, so you may miss your chance to answer.',
    ],
  },
  {
    icon: '🔄', title: 'What if I leave the room or get logged out?',
    body: [
      'You can return to an active room from your Dashboard using the Rejoin option.',
      'Answers you have already submitted are saved, and rejoining does not remove or recalculate the points you earned.',
      'Ended rooms cannot be rejoined.',
    ],
  },
  {
    icon: '🚫', title: 'What if the "Session Expired" message appears?',
    body: [
      'Try logging out and logging in again, performing a hard refresh, or changing your browser.',
    ],
  },
  {
    icon: '🔐', title: 'How do I change my password?',
    body: [
      'Open Profile, then select Change Password.',
    ],
  },
  {
    icon: '🏆', title: 'How does the leaderboard update?',
    body: [
      'The leaderboard is updated after every poll interval.',
      'You can see the Top 10, your poll score, your rank, and the number of correct answers out of the total questions.',
    ],
  },
  {
    icon: '📊', title: 'What will I see when the session ends?',
    body: [
      'The results page shows your session totals, leaderboard rank, and question-by-question results, including your answer correctness and points earned.',
    ],
  },
  {
    icon: '⭐', title: 'Do polls affect my SP points?',
    body: [
      'Yes. Your attendance and poll results affect your SP points.',
      'The points are based on the correctness of your answers.',
    ],
  },
  {
    icon: '🎬', title: 'What can I do with the video?',
    body: [
      'Some rooms include a YouTube video or live stream.',
      'You can pause and rewind the video, but you cannot seek ahead beyond the teacher’s current position.',
      'During a poll, the video pauses automatically and resumes after the poll closes.',
      'Generally, V-Talk sessions are not live-streamed. Spandan is used only for conducting polls during these sessions.',
    ],
  },
]

export default function HelpPage() {
  const { user } = useAuthStore()
  const isMobile = useIsMobile()
  const role = user?.role || 'student'
  const sections = role === 'teacher' ? TEACHER_SECTIONS : STUDENT_SECTIONS

  // Collapsible sections — accordion: at most ONE open at a time, all collapsed by default.
  // Opening a section closes whichever was open; clicking the open one closes it.
  const [openIdx, setOpenIdx] = useState(null)
  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i))

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', maxWidth: '100%',
      background: 'var(--bg-primary)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', boxSizing: 'border-box'
    }}>
      <Sidebar user={user} />

      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        marginLeft: 'var(--sidebar-width, 240px)', transition: 'margin-left 0.2s ease',
        maxWidth: '100%', boxSizing: 'border-box'
      }}>
        {/* Header */}
        <header style={{
          background: 'var(--header-bg)', color: 'white',
          padding: isMobile ? '20px 16px' : '24px 32px',
          paddingLeft: isMobile ? '64px' : '32px', boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Manual & Help
              </h1>
              <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>
                How to use Spandan as a {role}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              <ThemeToggle />
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: isMobile ? '16px' : '28px 32px', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '860px' }}>
            <p style={{ margin: '0 0 20px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Spandan turns a class into a live, interactive session: the teacher runs a room, students
              join with a code, and everyone answers questions in real time. Here is how it works.
            </p>

            {sections.map((s, idx) => {
              const isOpen = openIdx === idx
              return (
                <section key={s.title} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: '14px', padding: isMobile ? '16px' : '20px 22px', marginBottom: '16px',
                  boxShadow: 'var(--card-shadow)'
                }}>
                  {/* Clickable heading toggles the section open/closed. */}
                  <h2 style={{ margin: 0 }}>
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-expanded={isOpen}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                        fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)',
                        textAlign: 'left', fontFamily: 'inherit'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{s.icon}</span>
                      <span style={{ flex: 1 }}>{idx + 1}. {s.title}</span>
                      <span aria-hidden="true" style={{
                        fontSize: '13px', color: 'var(--text-secondary)', flexShrink: 0,
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease'
                      }}>▶</span>
                    </button>
                  </h2>
                  {/* Tailwind's Preflight base resets `list-style: none`, so set the marker type
                      explicitly (inline overrides the reset) to show numbers / bullets. */}
                  {isOpen && React.createElement(
                    s.ordered ? 'ol' : 'ul',
                    { style: {
                      margin: '12px 0 0', paddingLeft: '24px', color: 'var(--text-secondary)',
                      fontSize: '14px', lineHeight: 1.65,
                      listStyleType: s.ordered ? 'decimal' : 'disc',
                      listStylePosition: 'outside'
                    } },
                    s.body.map((line, i) => (
                      <li key={i} style={{ display: 'list-item', marginBottom: i < s.body.length - 1 ? '8px' : 0 }}>{line}</li>
                    ))
                  )}
                </section>
              )
            })}

            <p style={{ margin: '18px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Need more help? Contact your Spandan administrator.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
