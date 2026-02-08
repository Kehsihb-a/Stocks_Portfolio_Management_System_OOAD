package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FinnhubService {
    private static final String BASE_URL = "https://finnhub.io/api/v1";
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final RestTemplate restTemplate;

    @Value("${finnhub.api.key}")
    private String apiKey;

    public List<Map<String, Object>> getMarketNews() {
        requireApiKey();
        String url = String.format("%s/news?category=general&token=%s", BASE_URL, apiKey);
        List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
        validateListResponse(response);
        return response;
    }

    public List<Map<String, Object>> getCompanyNews(String symbol) {
        requireApiKey();
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(7);
        String url = String.format("%s/company-news?symbol=%s&from=%s&to=%s&token=%s",
                BASE_URL,
                symbol,
                from.format(DATE_FORMAT),
                to.format(DATE_FORMAT),
                apiKey);
        List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
        validateListResponse(response);
        return response;
    }

    public Map<String, Object> getCompanyProfile(String symbol) {
        requireApiKey();
        String url = String.format("%s/stock/profile2?symbol=%s&token=%s", BASE_URL, symbol, apiKey);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        validateMapResponse(response);
        return response;
    }

    public Map<String, Object> getBasicFinancials(String symbol) {
        requireApiKey();
        String url = String.format("%s/stock/metric?symbol=%s&metric=all&token=%s", BASE_URL, symbol, apiKey);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        validateMapResponse(response);
        return response;
    }

    public Map<String, Object> getQuote(String symbol) {
        requireApiKey();
        String url = String.format("%s/quote?symbol=%s&token=%s", BASE_URL, symbol, apiKey);
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        validateMapResponse(response);
        return response;
    }

    private void requireApiKey() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Finnhub API key not configured");
        }
    }

    private void validateMapResponse(Map<String, Object> response) {
        if (response == null) {
            throw new RuntimeException("No response from Finnhub");
        }
        Object error = response.get("error");
        if (error != null) {
            throw new RuntimeException(error.toString());
        }
    }

    private void validateListResponse(List<Map<String, Object>> response) {
        if (response == null) {
            throw new RuntimeException("No response from Finnhub");
        }
    }
}
