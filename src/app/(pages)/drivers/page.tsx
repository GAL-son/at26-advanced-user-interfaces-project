'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    TextField, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Tooltip, // 🟢 Dodany komponent podpowiedzi
    Box      // 🟢 Pomocniczy box kontenera
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'; // 🟢 Ikonka ognia dla serii combo

interface FormattedDriver {
    guid: string;
    mainName: string;
    altNames: string | null;
    currentElo: number;
    combo: number; // 🟢 Dodane pole combo do typowania
    racesCount: number;
    lastRaced: string | null;
}

function formatLastRaced(dateString: string | null): string {
    if (!dateString) return 'Brak wyścigów';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Dzisiaj';
    if (diffDays === 2) return 'Wczoraj';
    if (diffDays <= 7) return `${diffDays - 1} dni temu`;

    return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export default function DriversPage() {
    const [drivers, setDrivers] = useState<FormattedDriver[]>([]);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('elo');
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const observerTarget = useRef<HTMLDivElement>(null);

    // Debouncing
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset przy zmianie filtrów
    useEffect(() => {
        setDrivers([]);
        setPage(0);
        setHasMore(true);
    }, [debouncedSearch, sortBy]);

    // Fetch danych
    useEffect(() => {
        async function fetchDrivers() {
            if (!hasMore || loading) return;
            setLoading(true);

            try {
                const res = await fetch(
                    `/api/drivers?page=${page}&limit=20&search=${encodeURIComponent(debouncedSearch)}&sortBy=${sortBy}`
                );
                const data = await res.json();

                if (data.success) {
                    setDrivers(prev => (page === 0 ? data.drivers : [...prev, ...data.drivers]));
                    setHasMore(data.hasMore);
                }
            } catch (err) {
                console.error("Błąd pobierania kierowców:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDrivers();
    }, [page, debouncedSearch, sortBy]);

    // IntersectionObserver dla Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 1.0 }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [hasMore, loading]);

    return (
        <div className="container mx-auto p-6 max-w-5xl text-slate-100">
            <h1 className="text-3xl font-bold mb-6">Ranking Kierowców</h1>

            {/* Panel Filtrów */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700 items-center">
                <div className="flex-1 w-full">
                    <TextField
                        fullWidth
                        label="Szukaj kierowcy lub aliasu..."
                        variant="outlined"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputLabelProps={{ className: 'text-slate-400 focus:text-blue-500' }}
                        inputProps={{ className: 'text-slate-100 bg-slate-900 rounded-lg' }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#475569' },
                                '&:hover fieldset': { borderColor: '#64748b' },
                                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                            },
                        }}
                    />
                </div>
                
                <div className="w-full md:w-56">
                    <FormControl fullWidth variant="outlined">
                        <InputLabel className="text-slate-400">Sortuj po</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sortuj po"
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-slate-100 bg-slate-900 rounded-lg"
                            MenuProps={{
                                PaperProps: { className: 'bg-slate-800 text-slate-100 border border-slate-700' }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#64748b' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                                '& .MuiSvgIcon-root': { color: '#94a3b8' }
                            }}
                        >
                            <MenuItem value="elo" className="hover:bg-slate-700">Punkty ELO</MenuItem>
                            <MenuItem value="races" className="hover:bg-slate-700">Ilość wyścigów</MenuItem>
                            <MenuItem value="lastRaced" className="hover:bg-slate-700">Ostatni wyścig</MenuItem>
                            <MenuItem value="name" className="hover:bg-slate-700">Nazwa (A-Z)</MenuItem>
                        </Select>
                    </FormControl>
                </div>
            </div>

            {/* Tabela Wyników */}
            <TableContainer component={Paper} className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
                <Table>
                    <TableHead className="bg-slate-900">
                        <TableRow>
                            <TableCell align="center" className="text-slate-400 font-bold border-b border-slate-700 w-16">Pozycja</TableCell>
                            <TableCell className="text-slate-400 font-bold border-b border-slate-700">Kierowca</TableCell>
                            <TableCell align="center" className="text-slate-400 font-bold border-b border-slate-700 w-36">Wyścigi</TableCell>
                            <TableCell align="center" className="text-slate-400 font-bold border-b border-slate-700 w-40">Ostatni aktywny</TableCell>
                            <TableCell align="right" className="text-slate-400 font-bold border-b border-slate-700 w-36">Rating ELO</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {drivers.map((driver, index) => (
                            <TableRow key={driver.guid} className="hover:bg-slate-750/40 transition-colors">
                                <TableCell align="center" className="text-slate-400 font-bold border-b border-slate-700">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="border-b border-slate-700">
                                    {/* 🟢 Flexbox z obsługą płomienia combo obok imienia */}
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-100 text-base">{driver.mainName}</span>
                                        {driver.combo > 0 && (
                                            <Tooltip title={`Aktywna seria: ${driver.combo} wyścigów z rzędu. Przyszły zysk punktowy pomnożony o +${driver.combo * 10}%!`} arrow>
                                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', color: '#ff6d00', fontSize: '0.85rem', fontWeight: 700 }}>
                                                    <LocalFireDepartmentIcon size="small" />
                                                    <span>{driver.combo}</span>
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </div>
                                    {driver.altNames && (
                                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                                            Alias: {driver.altNames}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-slate-500 font-mono tracking-tight mt-0.5">
                                        ID: {driver.guid}
                                    </div>
                                </TableCell>
                                <TableCell align="center" className="text-slate-300 font-medium border-b border-slate-700">
                                    {driver.racesCount}
                                </TableCell>
                                <TableCell align="center" className="text-slate-400 text-sm font-medium border-b border-slate-700">
                                    {formatLastRaced(driver.lastRaced)}
                                </TableCell>
                                <TableCell align="right" className="text-emerald-400 font-mono font-bold text-lg border-b border-slate-700">
                                    {driver.currentElo.toFixed(1)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {drivers.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-400 bg-slate-800">
                        Nie znaleziono kierowców spełniających kryteria.
                    </div>
                )}

                <div ref={observerTarget} className="w-full py-6 flex justify-center bg-slate-900/30 border-t border-slate-700/50">
                    {loading && (
                        <div className="flex items-center gap-3 text-blue-400 font-medium text-sm">
                            <CircularProgress size={20} className="text-blue-500" />
                            Ładowanie kolejnych kierowców...
                        </div>
                    )}
                    {!hasMore && drivers.length > 0 && (
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            Koniec listy rankingowej
                        </span>
                    )}
                </div>
            </TableContainer>
        </div>
    );
}