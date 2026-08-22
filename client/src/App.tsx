import { useState } from 'react';
import { Header } from './components/Header';
import { NameEntry } from './components/NameEntry';
import { Warmup } from './components/Warmup';
import { TutorSession } from './components/TutorSession';
import { Dashboard } from './components/Dashboard';
import { api, Student } from './api';

type Stage = 'name' | 'warmup' | 'session';

export function App() {
  const [stage, setStage] = useState<Stage>('name');
  const [student, setStudent] = useState<Student | null>(null);
  const [skill, setSkill] = useState('fractions');
  const [streak, setStreak] = useState(0);
  const [mastery, setMastery] = useState(0);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const handleStart = async (name: string, language: string, chosenSkill: string) => {
    const newStudent = await api.createStudent(name, language);
    setStudent(newStudent);
    setSkill(chosenSkill);
    setStage('warmup');
  };

  return (
    <div className="min-h-screen bg-cream font-sans text-ink">
      <Header
        studentName={student?.name}
        streak={stage === 'session' ? streak : undefined}
        mastery={stage === 'session' ? mastery : undefined}
        onOpenDashboard={() => setDashboardOpen(true)}
        showDashboardLink={stage === 'session'}
      />

      {stage === 'name' && <NameEntry onStart={handleStart} />}

      {stage === 'warmup' && student && (
        <Warmup
          studentName={student.name}
          studentId={student.id}
          skill={skill}
          language={student.language}
          onDone={() => setStage('session')}
        />
      )}

      {stage === 'session' && student && (
        <TutorSession
          studentId={student.id}
          studentName={student.name}
          language={student.language}
          skill={skill}
          onProgressUpdate={(s, m) => {
            setStreak(s);
            setMastery(m);
          }}
        />
      )}

      {dashboardOpen && student ? (
        <Dashboard studentId={student.id} studentName={student.name} onClose={() => setDashboardOpen(false)} />
      ) : null}
    </div>
  );
}
