import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ddctlkwarmszbhrlvjdy.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_5eurSUmqRDCB_akKnXijlA_CMAVhknq';

const supabase = createClient(supabaseUrl, supabaseKey);

// Auto-seed function if Supabase is empty
async function autoSeedIfEmpty() {
  try {
    const { data: topics, error } = await supabase.from('topics').select('id').limit(1);
    if (!error && (!topics || topics.length === 0)) {
      console.log('⚡ Initializing empty Supabase database with GATE CSE & DA seed data...');
      const today = new Date();
      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      const subD = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
      };
      const addD = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d;
      };

      const seedTopics = [
        {
          id: '11111111-1111-1111-1111-111111111101',
          name: 'Relational Database Normalization (1NF to BCNF)',
          subject_name: 'Databases',
          exam: 'BOTH',
          first_studied_at: formatDate(subD(7)),
          topic_type: 'Mixed',
          learning_source: 'Lecture',
          initial_confidence: 'Medium',
          estimated_difficulty: 'Hard',
          mastery_status: 'Revising',
          notes: 'Remember: 3NF allows prime attribute on RHS of FD. BCNF requires LHS to be superkey strictly.',
          resource_url: 'https://gateoverflow.in',
          checklist: [
            { id: 'c1', text: 'Lossless join test with table intersection', done: true },
            { id: 'c2', text: 'Dependency preservation check with projection', done: true },
            { id: 'c3', text: 'Minimal cover computation', done: false }
          ]
        },
        {
          id: '11111111-1111-1111-1111-111111111102',
          name: 'Virtual Memory & Multi-level Paging',
          subject_name: 'Operating Systems',
          exam: 'CSE',
          first_studied_at: formatDate(subD(15)),
          topic_type: 'Numerical',
          learning_source: 'Notes',
          initial_confidence: 'High',
          estimated_difficulty: 'Medium',
          mastery_status: 'Revising',
          notes: 'Effective memory access time calculation with TLB hit and miss ratios.',
          resource_url: '',
          checklist: [
            { id: 'c4', text: 'Page table entry size calculation', done: true },
            { id: 'c5', text: 'Inverted page table space comparison', done: false }
          ]
        },
        {
          id: '11111111-1111-1111-1111-111111111103',
          name: 'Eigenvalues, SVD & PCA Dimensionality Reduction',
          subject_name: 'Linear Algebra',
          exam: 'DA',
          first_studied_at: formatDate(subD(3)),
          topic_type: 'Numerical',
          learning_source: 'Book',
          initial_confidence: 'Low',
          estimated_difficulty: 'Hard',
          mastery_status: 'Learning',
          notes: 'Covariance matrix symmetry implies orthogonal eigenvectors. Singular values are square roots of eigenvalues of A^T A.',
          resource_url: '',
          checklist: [
            { id: 'c6', text: 'Characteristic polynomial roots', done: true },
            { id: 'c7', text: 'Gram-Schmidt orthonormalization', done: false }
          ]
        },
        {
          id: '11111111-1111-1111-1111-111111111104',
          name: 'Gradient Descent & Backpropagation Mathematics',
          subject_name: 'Machine Learning',
          exam: 'DA',
          first_studied_at: formatDate(subD(1)),
          topic_type: 'Theory',
          learning_source: 'Lecture',
          initial_confidence: 'Medium',
          estimated_difficulty: 'Medium',
          mastery_status: 'Learning',
          notes: 'Chain rule of partial derivatives across activation layers. Vanishing gradient with Sigmoid.',
          resource_url: '',
          checklist: [
            { id: 'c8', text: 'Jacobian and Hessian matrix derivation', done: false }
          ]
        }
      ];

      await supabase.from('topics').upsert(seedTopics);

      const seedSessions = [
        {
          id: '22222222-2222-2222-2222-222222222201',
          topic_id: '11111111-1111-1111-1111-111111111101',
          sequence_number: 3,
          scheduled_date: formatDate(today),
          status: 'PENDING',
          duration_minutes: 30,
          questions_attempted: 0,
          questions_correct: 0
        },
        {
          id: '22222222-2222-2222-2222-222222222202',
          topic_id: '11111111-1111-1111-1111-111111111102',
          sequence_number: 4,
          scheduled_date: formatDate(subD(2)),
          status: 'PENDING',
          duration_minutes: 35,
          questions_attempted: 0,
          questions_correct: 0
        },
        {
          id: '22222222-2222-2222-2222-222222222203',
          topic_id: '11111111-1111-1111-1111-111111111103',
          sequence_number: 2,
          scheduled_date: formatDate(today),
          status: 'PENDING',
          duration_minutes: 40,
          questions_attempted: 0,
          questions_correct: 0
        },
        {
          id: '22222222-2222-2222-2222-222222222204',
          topic_id: '11111111-1111-1111-1111-111111111104',
          sequence_number: 1,
          scheduled_date: formatDate(addD(1)),
          status: 'PENDING',
          duration_minutes: 25,
          questions_attempted: 0,
          questions_correct: 0
        }
      ];
      await supabase.from('revision_sessions').upsert(seedSessions);

      const seedLogs = [
        {
          id: '33333333-3333-3333-3333-333333333301',
          topic_id: '11111111-1111-1111-1111-111111111101',
          subject_name: 'Databases',
          exam: 'CSE',
          gate_year: 2023,
          question_ref: 'GATE CSE 2023 Set 1 Q34',
          marks: 2.0,
          result: 'CORRECT',
          time_taken_seconds: 150,
          error_category: 'None',
          explanation: 'Checked BCNF violations by identifying non-superkey determinants correctly.',
          solved_independently: true
        },
        {
          id: '33333333-3333-3333-3333-333333333302',
          topic_id: '11111111-1111-1111-1111-111111111102',
          subject_name: 'Operating Systems',
          exam: 'CSE',
          gate_year: 2022,
          question_ref: 'GATE CSE 2022 Q18',
          marks: 2.0,
          result: 'INCORRECT',
          time_taken_seconds: 210,
          error_category: 'Calculation',
          explanation: 'Miscalculated number of bits required for frame offset in 2-level paging.',
          solved_independently: false
        }
      ];
      await supabase.from('practice_logs').upsert(seedLogs);

      const seedActivities = [
        { id: '44444444-4444-4444-4444-444444444401', activity_date: formatDate(subD(4)), activity_type: 'NEW_TOPIC', duration_minutes: 60 },
        { id: '44444444-4444-4444-4444-444444444402', activity_date: formatDate(subD(3)), activity_type: 'REVISION', duration_minutes: 45 },
        { id: '44444444-4444-4444-4444-444444444403', activity_date: formatDate(subD(2)), activity_type: 'PYQ', duration_minutes: 30 },
        { id: '44444444-4444-4444-4444-444444444404', activity_date: formatDate(subD(1)), activity_type: 'REVISION', duration_minutes: 50 },
        { id: '44444444-4444-4444-4444-444444444405', activity_date: formatDate(today), activity_type: 'PYQ', duration_minutes: 20 }
      ];
      await supabase.from('study_activities').upsert(seedActivities);

      console.log('✅ Supabase database successfully seeded with GATE topics, revisions, and practice records!');
    }
  } catch (e) {
    console.warn('Auto-seed check error:', e);
  }
}

// REST API Endpoints
app.get('/api/health', async (_req, res) => {
  try {
    const { error } = await supabase.from('topics').select('id').limit(1);
    res.json({ status: 'ok', supabaseConnected: !error, error: error?.message });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Topics
app.get('/api/topics', async (_req, res) => {
  const { data, error } = await supabase.from('topics').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/topics', async (req, res) => {
  const topic = req.body;
  const { data, error } = await supabase.from('topics').upsert(topic).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/topics/:id', async (req, res) => {
  const { id } = req.params;
  await supabase.from('revision_sessions').delete().eq('topic_id', id);
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Revision Sessions
app.get('/api/sessions', async (_req, res) => {
  const { data, error } = await supabase.from('revision_sessions').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/sessions', async (req, res) => {
  const sessions = Array.isArray(req.body) ? req.body : [req.body];
  const { data, error } = await supabase.from('revision_sessions').upsert(sessions).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Practice Logs
app.get('/api/practice-logs', async (_req, res) => {
  const { data, error } = await supabase.from('practice_logs').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/practice-logs', async (req, res) => {
  const log = req.body;
  const { data, error } = await supabase.from('practice_logs').insert(log).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Activities
app.get('/api/activities', async (_req, res) => {
  const { data, error } = await supabase.from('study_activities').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/activities', async (req, res) => {
  const act = req.body;
  const { data, error } = await supabase.from('study_activities').insert(act).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Reset / Seed route
app.post('/api/seed', async (_req, res) => {
  await autoSeedIfEmpty();
  res.json({ success: true, message: 'Database initialized' });
});

// Start Server and Mount Vite
async function startServer() {
  await autoSeedIfEmpty();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GATE Revision OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
