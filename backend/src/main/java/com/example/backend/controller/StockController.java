package com.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.service.StockService;
import com.example.backend.service.FinnhubService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {
    private final StockService stockService;
    private final FinnhubService finnhubService;
    private static final Logger log = LoggerFactory.getLogger(StockController.class);
    
    @Value("${finnhub.api.key}")
    private String finnhubKey;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchStocks(@RequestParam String symbol) {
        try {
            log.info("Searching for symbol: {}", symbol);
            Map<String, Object> result = stockService.searchStocks(symbol);
            log.info("Search results: {}", result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error searching stocks: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{symbol}/data")
    public ResponseEntity<Object> getStockData(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1h") String interval) {
        try {
            return ResponseEntity.ok(stockService.getStockData(symbol, interval));
        } catch (Exception e) {
            log.error("Error fetching stock data for {}: {}", symbol, e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{symbol}/quote")
    public ResponseEntity<Object> getQuote(@PathVariable String symbol) {
        try {
            return ResponseEntity.ok(stockService.getQuote(symbol));
        } catch (Exception e) {
            log.error("Error fetching quote for {}: {}", symbol, e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/top-movers")
    @Cacheable(value = "topMovers", sync = true)
    public ResponseEntity<Object> getTopMovers() {
        try {
            if (finnhubKey == null || finnhubKey.isBlank()) {
                return ResponseEntity.badRequest().body("Finnhub API key not configured");
            }
            log.info("Fetching top movers via Finnhub quotes");
            List<String> symbols = List.of(
                "AAPL","MSFT","AMZN","NVDA","GOOGL","META","TSLA","JPM","V","UNH",
                "XOM","PG","KO","DIS","AMD","NFLX","BA","WMT","COST","INTC"
            );

            List<Map<String, Object>> quotes = new ArrayList<>();
            for (String symbol : symbols) {
                try {
                    Map<String, Object> quote = finnhubService.getQuote(symbol);
                    double price = parseDouble(quote.get("c"));
                    double percentChange = parseDouble(quote.get("dp"));
                    quotes.add(Map.of(
                        "ticker", symbol,
                        "price", price,
                        "change_percentage", percentChange,
                        "volume", 0
                    ));
                } catch (Exception e) {
                    log.warn("Skipping symbol {} due to quote error: {}", symbol, e.getMessage());
                }
            }

            if (quotes.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Finnhub API error: no quotes returned. Check API key or rate limits.");
            }

            quotes.sort(Comparator.comparingDouble(o -> parseDouble(o.get("change_percentage"))));
            List<Map<String, Object>> topLosers = quotes.stream().limit(5).collect(Collectors.toList());
            List<Map<String, Object>> topGainers = quotes.stream()
                    .sorted(Comparator.comparingDouble(o -> -parseDouble(o.get("change_percentage"))))
                    .limit(5)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("top_gainers", topGainers);
            response.put("top_losers", topLosers);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching top movers: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{symbol}/fundamentals")
    public ResponseEntity<Object> getFundamentals(@PathVariable String symbol) {
        try {
            if (finnhubKey == null || finnhubKey.isBlank()) {
                return ResponseEntity.badRequest().body("Finnhub API key not configured");
            }
            log.info("Fetching fundamentals for symbol: {} (Finnhub)", symbol);
            Map<String, Object> profile = finnhubService.getCompanyProfile(symbol);
            Map<String, Object> financials = finnhubService.getBasicFinancials(symbol);

            Map<String, Object> metric = financials != null && financials.get("metric") instanceof Map<?, ?>
                ? (Map<String, Object>) financials.get("metric")
                : Map.of();

            Map<String, Object> response = new HashMap<>();
            response.put("CompanyName", profile.getOrDefault("name", null));
            response.put("Industry", profile.getOrDefault("finnhubIndustry", null));
            response.put("Weburl", profile.getOrDefault("weburl", null));
            response.put("Country", profile.getOrDefault("country", null));
            response.put("MarketCapitalization", metric.getOrDefault("marketCapitalization", profile.getOrDefault("marketCapitalization", null)));
            response.put("PERatio", metric.getOrDefault("peBasicExclExtraTTM", null));
            response.put("DividendYield", metric.getOrDefault("dividendYieldIndicatedAnnual", null));
            response.put("Beta", metric.getOrDefault("beta", null));
            response.put("BookValue", metric.getOrDefault("bookValuePerShareAnnual", null));
            response.put("EPS", metric.getOrDefault("epsTTM", null));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching fundamentals: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{symbol}/financials")
    public ResponseEntity<Object> getFinancials(@PathVariable String symbol) {
        try {
            if (finnhubKey == null || finnhubKey.isBlank()) {
                return ResponseEntity.badRequest().body("Finnhub API key not configured");
            }
            log.info("Fetching financials for symbol: {} (Finnhub)", symbol);
            Map<String, Object> financials = finnhubService.getBasicFinancials(symbol);
            return ResponseEntity.ok(financials);
        } catch (Exception e) {
            log.error("Error fetching financials: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/news")
    @Cacheable(value = "marketNews", sync = true)
    public ResponseEntity<Object> getMarketNews() {
        try {
            if (finnhubKey == null || finnhubKey.isBlank()) {
                return ResponseEntity.badRequest().body("Finnhub API key not configured");
            }
            log.info("Fetching market news from Finnhub");
            List<Map<String, Object>> news = finnhubService.getMarketNews();
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            log.error("Error fetching market news: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{symbol}/news")
    @Cacheable(value = "companyNews", key = "#symbol", sync = true)
    public ResponseEntity<Object> getCompanyNews(@PathVariable String symbol) {
        try {
            if (finnhubKey == null || finnhubKey.isBlank()) {
                return ResponseEntity.badRequest().body("Finnhub API key not configured");
            }
            log.info("Fetching company news for {}", symbol);
            List<Map<String, Object>> news = finnhubService.getCompanyNews(symbol);
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            log.error("Error fetching company news: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private double parseDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
