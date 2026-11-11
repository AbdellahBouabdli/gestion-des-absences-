import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import BrandMark from './components/BrandMark';
import LoginPage from './pages/LoginPage';
import { PageLoader } from './components/PageLoader';

const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherAbsencesPage = lazy(() => import('./pages/teacher/TeacherAbsencesPage'));
const TeacherJustificationsPage = lazy(() => import('./pages/teacher/TeacherJustificationsPage'));
const TeacherStudentsPage = lazy(() => import('./pages/teacher/TeacherStudentsPage'));
const TeacherSchedulePage = lazy(() => import('./pages/teacher/TeacherSchedulePage'));
const TeacherStatsPage = lazy(() => import('./pages/teacher/TeacherStatsPage'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentAbsencesPage = lazy(() => import('./pages/student/StudentAbsencesPage'));
const StudentSchedulePage = lazy(() => import('./pages/student/StudentSchedulePage'));
const StudentJustificationsPage = lazy(() => import('./pages/student/StudentJustificationsPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminStudentsPage = lazy(() => import('./pages/admin/AdminStudentsPage'));
const AdminTeachersPage = lazy(() => import('./pages/admin/AdminTeachersPage'));
const AdminGroupsPage = lazy(() => import('./pages/admin/AdminGroupsPage'));
const AdminStatsPage = lazy(() => import('./pages/admin/AdminStatsPage'));

const ROLE_HOME = { ADMIN: '/admin', TEACHER: '/teacher', STUDENT: '/student' };

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login'} replace />;
}

function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <AppLayout />;
}

function RoleGate({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return children;
}

function PublicOnly() {
  const { user } = useAuth();
  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <LoginPage />;
}

function NotFoundPage() {
  const { user } = useAuth();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#10263b',
        color: '#fff',
        px: 3,
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 460 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
          <BrandMark inverse />
        </Box>
        <Typography sx={{ fontFamily: "'Manrope Variable'", fontSize: 86, fontWeight: 800, lineHeight: 0.9, color: '#45c7b5' }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mt: 2 }}>
          Cette page n’existe pas
        </Typography>
        <Typography sx={{ mt: 1, color: 'rgba(255,255,255,.55)', fontSize: 13 }}>
          Le lien est peut-être obsolète, ou la page a été déplacée.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          href={user ? ROLE_HOME[user.role] : '/login'}
          sx={{ mt: 3 }}
        >
          Retour à mon espace
        </Button>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><PageLoader /></Box>}>
      <Routes>
      <Route path="/login" element={<PublicOnly />} />
      <Route path="/" element={<RoleHome />} />
      <Route element={<RequireAuth />}>
        <Route path="/teacher" element={<RoleGate role="TEACHER"><TeacherDashboard /></RoleGate>} />
        <Route path="/teacher/absences" element={<RoleGate role="TEACHER"><TeacherAbsencesPage /></RoleGate>} />
        <Route path="/teacher/justifications" element={<RoleGate role="TEACHER"><TeacherJustificationsPage /></RoleGate>} />
        <Route path="/teacher/students" element={<RoleGate role="TEACHER"><TeacherStudentsPage /></RoleGate>} />
        <Route path="/teacher/schedule" element={<RoleGate role="TEACHER"><TeacherSchedulePage /></RoleGate>} />
        <Route path="/teacher/stats" element={<RoleGate role="TEACHER"><TeacherStatsPage /></RoleGate>} />

        <Route path="/student" element={<RoleGate role="STUDENT"><StudentDashboard /></RoleGate>} />
        <Route path="/student/absences" element={<RoleGate role="STUDENT"><StudentAbsencesPage /></RoleGate>} />
        <Route path="/student/schedule" element={<RoleGate role="STUDENT"><StudentSchedulePage /></RoleGate>} />
        <Route path="/student/justifications" element={<RoleGate role="STUDENT"><StudentJustificationsPage /></RoleGate>} />

        <Route path="/admin" element={<RoleGate role="ADMIN"><AdminDashboard /></RoleGate>} />
        <Route path="/admin/students" element={<RoleGate role="ADMIN"><AdminStudentsPage /></RoleGate>} />
        <Route path="/admin/teachers" element={<RoleGate role="ADMIN"><AdminTeachersPage /></RoleGate>} />
        <Route path="/admin/groups" element={<RoleGate role="ADMIN"><AdminGroupsPage /></RoleGate>} />
        <Route path="/admin/stats" element={<RoleGate role="ADMIN"><AdminStatsPage /></RoleGate>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
