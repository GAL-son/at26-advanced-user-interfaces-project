import React from 'react';
import { Box, Typography, Paper, ButtonBase } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';
import SpeedIcon from '@mui/icons-material/Speed';

interface EventRowProps {
  event: {
    id: string; // Nasz hash / unikalne ID wyścigu
    server: string;
    track: string;
    date: string;
    jsonUrl: string;
  };
}

export default function EventRow({ event }: EventRowProps) {
  const readableTrack = event.track.replace(/_/g, ' ');
  const cleanServer = event.server.replace('https://', '');
  const formattedDate = new Date(event.date).toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // ZMIANA: Kierujemy bezpośrednio na dynamiczny routing /event/[id]
  const targetUrl = `/event/${event.id}`;

  return (
    <Paper
      component="li"
      role="listitem"
      elevation={0}
      sx={{
        mb: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
      }}
    >
      <ButtonBase
        component="a"
        href={targetUrl}
        aria-label={`Wyścig na torze ${readableTrack}, data: ${formattedDate}, serwer: ${cleanServer}. Zobacz szczegółowe wyniki.`}
        sx={{
          width: '100%',
          p: 1.5,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1, sm: 4 },
          textAlign: 'left',
          transition: 'background-color 0.2s, box-shadow 0.2s',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '-2px',
          },
        }}
      >
        {/* Lewa strona: Tor oraz Czas wyścigu */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' }, 
            gap: { xs: 0.5, md: 3 },
            flexGrow: 1,
            minWidth: 0 
          }}
        >
          <Typography 
            variant="body1" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              textTransform: 'capitalize',
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            <SpeedIcon color="action" fontSize="small" aria-hidden="true" />
            {readableTrack}
          </Typography>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}
          >
            <EventIcon fontSize="small" aria-hidden="true" />
            <Box component="span" sx={{ display: 'none' }}>Data wyścigu: </Box>
            {formattedDate}
          </Typography>
        </Box>

        {/* Prawa strona: Serwer */}
        <Box 
          sx={{ 
            alignSelf: { xs: 'flex-start', sm: 'center' },
            ml: { sm: 'auto' },
            flexShrink: 0
          }}
        >
          <Typography 
            variant="body2" 
            color="primary.main"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              fontWeight: 500,
              px: 1,
              py: 0.5,
              borderRadius: 1
            }}
          >
            <StorageIcon fontSize="small" aria-hidden="true" />
            <Box component="span" sx={{ display: 'none' }}>Serwer: </Box>
            {cleanServer}
          </Typography>
        </Box>
      </ButtonBase>
    </Paper>
  );
}