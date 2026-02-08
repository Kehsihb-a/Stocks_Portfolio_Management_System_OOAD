package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StockService {
    private final RestTemplate restTemplate;
    private static final Logger log = LoggerFactory.getLogger(StockService.class);
    
    @Value("${twelvedata.api.key}")
    private String apiKey;
    
    private static final String BASE_URL = "https://api.twelvedata.com";

    public Map<String, Object> searchStocks(String symbol) {
        requireApiKey();
        String url = String.format("%s/symbol_search?symbol=%s&apikey=%s", BASE_URL, symbol, apiKey);
        log.info("Searching stocks with URL: {}", url);
        
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            validateTwelveDataResponse(response);
            log.info("Search response: {}", response);
            return response;
        } catch (Exception e) {
            log.error("Error searching stocks: ", e);
            throw new RuntimeException("Failed to search stocks", e);
        }
    }

    public Map<String, Object> getStockData(String symbol, String interval) {
        requireApiKey();
        String url = String.format("%s/time_series?symbol=%s&interval=%s&apikey=%s", 
            BASE_URL, symbol, interval, apiKey);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        validateTwelveDataResponse(response);
        return response;
    }

    public Map<String, Object> getQuote(String symbol) {
        requireApiKey();
        String url = String.format("%s/quote?symbol=%s&apikey=%s", BASE_URL, symbol, apiKey);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        validateTwelveDataResponse(response);
        return response;
    }

    private void requireApiKey() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("TwelveData API key not configured");
        }
    }

    private void validateTwelveDataResponse(Map<String, Object> response) {
        if (response == null) {
            throw new RuntimeException("No response from TwelveData");
        }
        Object status = response.get("status");
        Object code = response.get("code");
        Object message = response.get("message");
        if ("error".equals(status) || code != null || message != null) {
            throw new RuntimeException(message != null ? message.toString() : "TwelveData API error");
        }
    }
}
