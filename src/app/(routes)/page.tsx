"use client";
import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, CardActions, Button, Grid, Box, CircularProgress } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    const res = await fetch('/api/fetch-events');
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          Zarządzanie Wynikami ACSM
        </Typography>
        <Button variant="contained" onClick={loadEvents} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Odśwież listę"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {events.map((event: any) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StorageIcon fontSize="inherit" /> {event.server.replace('https://', '')}
                </Typography>
                <Typography variant="h6" component="h2" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {event.track.replace(/_/g, ' ')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon fontSize="inherit" /> {new Date(event.date).toLocaleString('pl-PL')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="outlined" 
                  fullWidth
                  href={`/results?url=${encodeURIComponent(event.jsonUrl)}`}
                  aria-label={`Zobacz szczegółowe wyniki dla wyścigu na torze ${event.track}`}
                >
                  Pobierz JSON
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}