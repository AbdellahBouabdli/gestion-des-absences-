import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import WeekNavigator from '../../components/WeekNavigator';
import ScheduleView from '../../components/ScheduleView';
import { PageError, PageLoader } from '../../components/PageLoader';
import { teacherApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { currentWeek } from '../../utils/format';

export default function TeacherSchedulePage() {
  const [anchor, setAnchor] = useState(dayjs());
  const week = currentWeek(anchor);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['teacher-schedule', week.from, week.to],
    queryFn: () => teacherApi.schedule({ from: week.from, to: week.to }),
  });

  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="Emploi du temps"
        subtitle="Retrouvez vos séances de la semaine, leurs groupes et leurs salles."
        actions={
          <Chip
            label={`${data?.length || 0} séance(s) cette semaine`}
            sx={{ bgcolor: '#eaf7f4', color: 'secondary.dark', height: 34 }}
          />
        }
      />

      <Box sx={{ maxWidth: 520, mb: 2.5 }}>
        <WeekNavigator
          start={week.start}
          onPrevious={() => setAnchor((value) => value.subtract(1, 'week'))}
          onNext={() => setAnchor((value) => value.add(1, 'week'))}
          onToday={() => setAnchor(dayjs())}
          label="Votre semaine"
        />
      </Box>

      {isLoading ? (
        <PageLoader label="Chargement de votre emploi du temps…" />
      ) : isError ? (
        <PageError message={getErrorMessage(error)} onRetry={refetch} />
      ) : (
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <ScheduleView sessions={data || []} perspective="teacher" />
        </Card>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Chip label="Les séances passées sont disponibles dans l’historique des absences" sx={{ bgcolor: '#fff', border: '1px solid #e7edf3', color: 'text.secondary' }} />
      </Stack>
      <Typography sx={{ mt: 1.5, fontSize: 10.8, color: 'text.secondary' }}>
        Astuce : utilisez les flèches pour naviguer entre les semaines.
      </Typography>
    </>
  );
}
