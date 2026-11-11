import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import CoPresentRoundedIcon from '@mui/icons-material/CoPresentRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';

const demoAccounts = [
  {
    key: 'admin',
    label: 'Administration',
    email: 'admin@univ.ma',
    password: 'Admin123!',
    icon: AdminPanelSettingsRoundedIcon,
    color: '#e9a23b',
  },
  {
    key: 'teacher',
    label: 'Enseignant',
    email: 'teacher@univ.ma',
    password: 'Teacher123!',
    icon: CoPresentRoundedIcon,
    color: '#45c7b5',
  },
  {
    key: 'student',
    label: 'Étudiant',
    email: 'student@univ.ma',
    password: 'Student123!',
    icon: SchoolRoundedIcon,
    color: '#7aa7f8',
  },
];

const highlights = [
  { icon: CheckCircleRoundedIcon, text: 'Pointage des absences en quelques secondes' },
  { icon: FactCheckRoundedIcon, text: 'Justificatifs centralisés et suivis' },
  { icon: QueryStatsRoundedIcon, text: 'Statistiques claires pour chaque groupe' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  const goToSpace = (user) => navigate(`/${user.role.toLowerCase()}`, { replace: true });

  const submit = async (event) => {
    event?.preventDefault();
    if (!values.email || !values.password) {
      setError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }
    setError('');
    setBusy('form');
    try {
      const user = await login(values.email.trim(), values.password);
      goToSpace(user);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Connexion impossible.'));
    } finally {
      setBusy(null);
    }
  };

  const loginDemo = async (account) => {
    setValues({ email: account.email, password: account.password });
    setError('');
    setBusy(account.key);
    try {
      const user = await login(account.email, account.password);
      goToSpace(user);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1.08fr 0.92fr' },
        bgcolor: '#f5f8fb',
      }}
    >
      <Box
        className="hero-grid"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { lg: 6, xl: 7.5 },
          color: '#fff',
          background: 'linear-gradient(150deg, #132f49 0%, #0e253b 48%, #091c2d 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 620,
            height: 620,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,157,138,.22) 0%, rgba(15,157,138,0) 68%)',
            right: -220,
            top: -230,
          }}
        />
        <Box className="login-orbit" sx={{ width: 440, height: 440, right: -120, top: -100 }}>
          <Box sx={{ position: 'absolute', top: '18%', left: '-4px' }} />
        </Box>
        <Box className="login-orbit" sx={{ width: 720, height: 720, right: -300, top: -240 }} />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <BrandMark inverse />
          <Chip
            label="Année universitaire 2026 — 2027"
            sx={{
              mt: 6,
              bgcolor: 'rgba(69,199,181,.12)',
              color: '#7ce0d1',
              border: '1px solid rgba(69,199,181,.2)',
              fontSize: 11,
              height: 27,
            }}
          />
          <Typography
            variant="h1"
            sx={{ mt: 2.5, fontSize: { lg: 49, xl: 58 }, lineHeight: 1.06, letterSpacing: '-0.05em' }}
          >
            Chaque absence,
            <br />
            <Box component="span" sx={{ color: '#5ad1c0' }}>
              enfin sous contrôle.
            </Box>
          </Typography>
          <Typography sx={{ mt: 2.5, color: 'rgba(255,255,255,.58)', maxWidth: 470, fontSize: 15.5, lineHeight: 1.7 }}>
            Une plateforme unique pour les enseignants, les étudiants et l&apos;administration.
            Suivez, justifiez et analysez la présence en toute simplicité.
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 4.5 }}>
            {highlights.map(({ icon: Icon, text }) => (
              <Stack key={text} direction="row" spacing={1.4} alignItems="center">
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(69,199,181,.1)',
                    border: '1px solid rgba(69,199,181,.16)',
                  }}
                >
                  <Icon sx={{ fontSize: 16, color: '#5ad1c0' }} />
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,.72)', fontSize: 13.5 }}>{text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, mt: 6 }}>
          <Box
            sx={{
              display: 'inline-flex',
              gap: 4,
              p: 2.5,
              pr: 4,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,.045)',
              border: '1px solid rgba(255,255,255,.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {[
              ['91,4 %', 'Taux de présence'],
              ['3', 'Rôles connectés'],
              ['100 %', 'Sécurisé JWT'],
            ].map(([value, label]) => (
              <Box key={label}>
                <Typography sx={{ fontFamily: "'Manrope Variable'", fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em' }}>
                  {value}
                </Typography>
                <Typography sx={{ fontSize: 10.5, color: 'rgba(255,255,255,.42)', mt: 0.2 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 2.5, sm: 5, lg: 7 },
          py: { xs: 5, lg: 4 },
          position: 'relative',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 430 }}>
          <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 5 }}>
            <BrandMark />
          </Box>
          <Typography variant="overline" sx={{ color: 'secondary.main', fontSize: 10.5 }}>
            BIENVENUE
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: 29, sm: 34 } }}>
            Bon retour parmi nous
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1, fontSize: 13.5 }}>
            Connectez-vous à votre espace Campus Présence.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={submit} sx={{ mt: 3.5 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.8 }}>
                  Adresse email
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="prenom.nom@univ.ma"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { height: 48, bgcolor: '#fff' } }}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 0.8 }}>
                  Mot de passe
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="Votre mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                            onClick={() => setShowPassword((current) => !current)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { height: 48, bgcolor: '#fff' } }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={Boolean(busy)}
                endIcon={busy === 'form' ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <ArrowForwardRoundedIcon />}
                sx={{ mt: 0.5, height: 49 }}
              >
                {busy === 'form' ? 'Connexion…' : 'Se connecter'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', px: 1, fontSize: 10.5 }}>
              ACCÈS DE DÉMONSTRATION
            </Typography>
          </Divider>

          <Stack spacing={1}>
            {demoAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <Box
                  key={account.key}
                  component="button"
                  type="button"
                  onClick={() => loginDemo(account)}
                  disabled={Boolean(busy)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.4,
                    width: '100%',
                    border: '1px solid #e2eaf2',
                    bgcolor: '#fff',
                    borderRadius: 2.8,
                    p: 1.4,
                    cursor: busy ? 'wait' : 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'all .18s ease',
                    '&:hover': { borderColor: '#b9d8d2', bgcolor: '#fbfefd', transform: 'translateY(-1px)' },
                    '&:disabled': { opacity: 0.65, cursor: 'wait' },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2.2,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: `${account.color}14`,
                      color: account.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 19 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2 }}>{account.label}</Typography>
                    <Typography sx={{ fontSize: 10.8, color: 'text.secondary', mt: 0.2 }}>{account.email}</Typography>
                  </Box>
                  {busy === account.key ? (
                    <CircularProgress size={17} />
                  ) : (
                    <ArrowForwardRoundedIcon sx={{ fontSize: 17, color: '#9aabba' }} />
                  )}
                </Box>
              );
            })}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.7} sx={{ mt: 3, justifyContent: 'center' }}>
            <ShieldRoundedIcon sx={{ fontSize: 14, color: '#92a3b5' }} />
            <Typography sx={{ fontSize: 10.8, color: 'text.secondary' }}>
              Connexion sécurisée · JWT & chiffrement BCrypt
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', textAlign: 'center', mt: 1.6 }}>
            Besoin de l&apos;API ?{' '}
            <Link href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer" sx={{ fontWeight: 700 }}>
              Documentation Swagger
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
