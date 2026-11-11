import { Avatar } from '@mui/material';
import { initials } from '../utils/format';

const palette = ['#0f9d8a', '#3b82f6', '#8b5cf6', '#e76f51', '#e9a23b', '#0891b2'];

export default function UserAvatar({ name, size = 36, sx }) {
  const color = palette[(name?.charCodeAt(0) || 0) % palette.length];
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        fontWeight: 750,
        bgcolor: `${color}18`,
        color,
        border: `1px solid ${color}30`,
        ...sx,
      }}
    >
      {initials(name)}
    </Avatar>
  );
}
