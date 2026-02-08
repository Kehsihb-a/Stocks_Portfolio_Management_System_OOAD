import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import api from '../services/api';

const DEFAULT_SYMBOLS = [
  'AAPL','MSFT','NVDA','AMZN','META','TSLA','GOOGL','NFLX','AMD','INTC',
  'JPM','V','MA','XOM','UNH','PG','COST','WMT','BA','DIS'
];

const MarketTicker = ({ symbols = DEFAULT_SYMBOLS }) => {
  const [quotes, setQuotes] = useState({});

  const fetchQuotes = async () => {
    try {
      const results = await Promise.all(
        symbols.map((symbol) =>
          api.get(`/stocks/${symbol}/quote`)
            .then(res => ({ symbol, data: res.data }))
            .catch(() => ({ symbol, data: null }))
        )
      );
      const map = results.reduce((acc, { symbol, data }) => {
        if (data) acc[symbol] = data;
        return acc;
      }, {});
      setQuotes(map);
    } catch {
      setQuotes({});
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, []);

  const rows = useMemo(() => {
    return symbols
      .filter((s) => quotes[s])
      .map((s) => {
        const q = quotes[s];
        const price = parseFloat(q.close || q.c || 0);
        const pct = parseFloat(q.percent_change || q.dp || 0);
        return { symbol: s, price, pct };
      });
  }, [quotes, symbols]);

  if (!rows.length) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(90deg, rgba(15,45,92,0.9) 0%, rgba(29,95,209,0.9) 50%, rgba(42,114,255,0.9) 100%)',
        color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.12)'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          whiteSpace: 'nowrap',
          py: 1,
          px: 2,
          animation: 'ticker 22s linear infinite',
          '@keyframes ticker': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' }
          }
        }}
      >
        {[...rows, ...rows].map((row, idx) => (
          <Box key={`${row.symbol}-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Typography sx={{ fontWeight: 700 }}>{row.symbol}</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              ${row.price.toFixed(2)}
            </Typography>
            <Typography sx={{ color: row.pct >= 0 ? '#b7f5d3' : '#ffd1d1', fontWeight: 600 }}>
              {row.pct >= 0 ? '+' : ''}{row.pct.toFixed(2)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MarketTicker;
