import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, Chip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import WeekNavigator from '../../components/WeekNavigator';
import ScheduleView from '../../components/ScheduleView';
import { PageError, PageLoader } from '../../components/PageLoader';
import { studentApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { currentWeek } from '../../utils/format';

export default function StudentSchedulePage() {
  const [anchor, setAnchor] = useState(dayjs());
  const week = currentWeek(anchor);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-schedule', week.from, week.to],
    queryFn: () => studentApi.schedule({ from: week.from, to: week.to }),
  });

  return (
    <>
      <PageHeader
        eyebrow="Mon organisation"
        title="Emploi du temps"
        subtitle="Consultez vos cours de la semaine, les salles et les enseignants."
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
          label="Ma semaine"
        />
      </Box>

      {isLoading ? (
        <PageLoader label="Chargement de votre emploi du temps…" />
      ) : isError ? (
        <PageError message={getErrorMessage(error)} onRetry={refetch} />
      ) : (
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <ScheduleView sessions={data || []} perspective="student" />
        </Card>
      )}

      <Typography sx={{ mt: 2, fontSize: 10.8, color: 'text.secondary' }}>
        Les séances affichées correspondent à votre groupe{data?.length ? ` · ${data[0].groupName}` : ''}.
      </Typography>
    </>
  );
}
