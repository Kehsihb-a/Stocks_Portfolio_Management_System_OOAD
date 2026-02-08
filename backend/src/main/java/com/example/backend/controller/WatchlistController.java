package com.example.backend.controller;

import com.example.backend.model.WatchList;
import com.example.backend.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlists")
@RequiredArgsConstructor
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:3001",
    "https://stock-portfolio-frontend.onrender.com"
})
public class WatchlistController {
    private final WatchlistService watchlistService;
    private static final Logger log = LoggerFactory.getLogger(WatchlistController.class);

    @GetMapping
    public ResponseEntity<List<WatchList>> getAllWatchlists() {
        List<WatchList> watchlists = watchlistService.getUserWatchlists();
        log.info("Fetched {} watchlists", watchlists.size());
        return ResponseEntity.ok(watchlists);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWatchlistById(@PathVariable Long id) {
        try {
            WatchList watchlist = watchlistService.getWatchlistById(id);
            log.info("Fetched watchlist: {}", watchlist);
            return ResponseEntity.ok(watchlist);
        } catch (Exception e) {
            log.error("Error fetching watchlist: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Error accessing watchlist: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<WatchList> createWatchlist(@RequestBody WatchList watchlist) {
        WatchList created = watchlistService.createWatchlist(watchlist);
        log.info("Created watchlist: {}", created);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{id}/stocks/{symbol}")
    public ResponseEntity<WatchList> addStock(@PathVariable Long id, @PathVariable String symbol) {
        WatchList updated = watchlistService.addStockToWatchlist(id, symbol);
        log.info("Added stock {} to watchlist {}", symbol, id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/stocks/{symbol}")
    public ResponseEntity<WatchList> removeStock(@PathVariable Long id, @PathVariable String symbol) {
        WatchList updated = watchlistService.removeStockFromWatchlist(id, symbol);
        log.info("Removed stock {} from watchlist {}", symbol, id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWatchlist(@PathVariable Long id) {
        try {
            watchlistService.deleteWatchlist(id);
            log.info("Deleted watchlist with id: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting watchlist: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Error deleting watchlist: " + e.getMessage());
        }
    }
} 
