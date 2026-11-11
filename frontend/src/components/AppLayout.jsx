import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CoPresentRoundedIcon from '@mui/icons-material/CoPresentRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import BrandMark from './BrandMark';
import UserAvatar from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import { roleLabels } from '../utils/format';

const DRAWER_WIDTH = 270;

const navByRole = {
  TEACHER: [
    { label: 'Tableau de bord', path: '/teacher', icon: DashboardRoundedIcon },
    { label: 'Absences', path: '/teacher/absences', icon: EventBusyRoundedIcon },
    { label: 'Justificatifs', path: '/teacher/justifications', icon: FactCheckRoundedIcon },
    { label: 'Étudiants', path: '/teacher/students', icon: PeopleAltRoundedIcon },
    { label: 'Emploi du temps', path: '/teacher/schedule', icon: CalendarMonthRoundedIcon },
    { label: 'Statistiques', path: '/teacher/stats', icon: InsightsRoundedIcon },
  ],
  STUDENT: [
    { label: 'Tableau de bord', path: '/student', icon: DashboardRoundedIcon },
    { label: 'Mes absences', path: '/student/absences', icon: EventBusyRoundedIcon },
    { label: 'Emploi du temps', path: '/student/schedule', icon: CalendarMonthRoundedIcon },
    { label: 'Mes justificatifs', path: '/student/justifications', icon: FactCheckRoundedIcon },
  ],
  ADMIN: [
    { label: 'Tableau de bord', path: '/admin', icon: DashboardRoundedIcon },
    { label: 'Étudiants', path: '/admin/students', icon: PeopleAltRoundedIcon },
    { label: 'Enseignants', path: '/admin/teachers', icon: CoPresentRoundedIcon },
    { label: 'Groupes', path: '/admin/groups', icon: GroupsRoundedIcon },
    { label: 'Statistiques', path: '/admin/stats', icon: InsightsRoundedIcon },
  ],
};

function SidebarContent({ user, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const items = navByRole[user.role] || [];

  const isSelected = (item) => {
    if (item.path.split('/').length === 2) return location.pathname === item.path;
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        background: 'linear-gradient(178deg, #112a41 0%, #0c2135 55%, #0a1c2e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15,157,138,.18), transparent 70%)',
          top: -140,
          right: -110,
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ px: 3, pt: 3.2, pb: 2.4, position: 'relative' }}>
        <BrandMark inverse />
        <Box
          sx={{
            mt: 2.6,
            px: 1.4,
            py: 1,
            borderRadius: 2.4,
            bgcolor: alpha('#ffffff', 0.055),
            border: `1px solid ${alpha('#ffffff', 0.07)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 10, letterSpacing: '.12em', color: 'rgba(255,255,255,.42)', fontWeight: 700 }}>
              ESPACE
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#f0f6fa' }}>
              {roleLabels[user.role]}
            </Typography>
          </Box>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#45c7b5', boxShadow: '0 0 10px #45c7b5' }} />
        </Box>
      </Box>

      <Typography
        sx={{
          px: 3,
          pt: 1.2,
          pb: 1,
          fontSize: 10,
          fontWeight: 750,
          letterSpacing: '.14em',
          color: 'rgba(255,255,255,.35)',
        }}
      >
        NAVIGATION
      </Typography>
      <List sx={{ px: 1.6, py: 0, flex: 1, overflowY: 'auto' }}>
        {items.map((item) => {
          const Icon = item.icon;
          const selected = isSelected(item);
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onNavigate}
              selected={selected}
              className="nav-item"
              sx={{
                borderRadius: 2.4,
                mb: 0.4,
                px: 1.4,
                py: 1.05,
                color: selected ? '#fff' : 'rgba(255,255,255,.62)',
                '&.Mui-selected': { bgcolor: 'rgba(255,255,255,.075)' },
                '&.Mui-selected:hover': { bgcolor: 'rgba(255,255,255,.09)' },
                '&:hover': { bgcolor: 'rgba(255,255,255,.05)', color: '#fff' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: selected ? '#5ad1c0' : 'rgba(255,255,255,.42)' }}>
                <Icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 13.2,
                  fontWeight: selected ? 700 : 550,
                  letterSpacing: '-0.01em',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ px: 2, pt: 1.5, pb: 2.5 }}>
        <Box
          component="a"
          href="http://localhost:8080/swagger-ui.html"
          target="_blank"
          rel="noreferrer"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.4,
            py: 1,
            mb: 1.6,
            borderRadius: 2,
            color: 'rgba(255,255,255,.5)',
            textDecoration: 'none',
            fontSize: 12,
            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,.04)' },
          }}
        >
          <MenuBookRoundedIcon sx={{ fontSize: 17 }} />
          Documentation API
          <OpenInNewRoundedIcon sx={{ fontSize: 13, ml: 'auto' }} />
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,.08)', mb: 1.6 }} />
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <UserAvatar name={user.fullName} size={38} sx={{ bgcolor: 'rgba(69,199,181,.15)', color: '#69d9c9', borderColor: 'rgba(69,199,181,.25)' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ color: '#f2f7fa', fontSize: 12.5, fontWeight: 700 }}>
              {user.fullName}
            </Typography>
            <Typography noWrap sx={{ color: 'rgba(255,255,255,.4)', fontSize: 10.5 }}>
              {user.email}
            </Typography>
          </Box>
          <Tooltip title="Se déconnecter">
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,.07)' } }}>
              <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
}

export default function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const items = navByRole[user.role] || [];
  const current = items.find((item) =>
    item.path.split('/').length === 2
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path),
  );

  const handleLogout = () => {
    setAccountAnchor(null);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box className="app-canvas" sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 0,
          },
        }}
      >
        <SidebarContent user={user} />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { width: 278, border: 0 },
        }}
      >
        <SidebarContent user={user} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            display: { xs: 'flex', lg: 'none' },
            bgcolor: 'rgba(255,255,255,.92)',
            backdropFilter: 'blur(14px)',
            color: 'text.primary',
            borderBottom: '1px solid #e7edf3',
          }}
        >
          <Toolbar sx={{ minHeight: 62, gap: 1 }}>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
              <MenuRoundedIcon />
            </IconButton>
            <BrandMark compact />
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Mon compte">
              <IconButton onClick={(event) => setAccountAnchor(event.currentTarget)} size="small">
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#eef7f5', color: 'secondary.dark', fontSize: 12, fontWeight: 750 }}>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            minHeight: 68,
            px: 4,
            bgcolor: 'rgba(255,255,255,.65)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e8eef4',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.primary' }}>
              {current?.label || 'Espace personnel'}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: 'text.secondary', textTransform: 'capitalize' }}>
              {dayjs().format('dddd D MMMM YYYY')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Chip
            size="small"
            label="Service en ligne"
            sx={{ bgcolor: '#eaf8f4', color: 'secondary.dark', height: 25, fontSize: 10.5, mr: 2 }}
          />
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mr: 2 }}>{user.email}</Typography>
          <IconButton onClick={(event) => setAccountAnchor(event.currentTarget)} size="small">
            <UserAvatar name={user.fullName} size={34} />
          </IconButton>
        </Box>

        <Box
          component="main"
          sx={{
            width: '100%',
            maxWidth: 1460,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 3, lg: 4 },
            flex: 1,
          }}
        >
          <Box className="page-enter" key={location.pathname}>
            <Outlet />
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 230, p: 0.6 } } }}
      >
        <Box sx={{ px: 1.5, py: 1.2, mb: 0.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 750 }}>{user.fullName}</Typography>
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{user.email}</Typography>
          <Chip
            size="small"
            label={roleLabels[user.role]}
            sx={{ mt: 0.8, height: 21, fontSize: 10, bgcolor: '#eef3f8' }}
          />
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: 1.5, mt: 0.5, color: 'error.main', gap: 1 }}>
          <LogoutRoundedIcon sx={{ fontSize: 18 }} />
          Se déconnecter
        </MenuItem>
      </Menu>
    </Box>
  );
}
