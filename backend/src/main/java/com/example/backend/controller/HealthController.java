package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${twelvedata.api.key:}")
    private String twelveDataKey;

    @Value("${alphavantage.api.key:}")
    private String alphaVantageKey;

    @Value("${finnhub.api.key:}")
    private String finnhubKey;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "twelvedataKeySet", twelveDataKey != null && !twelveDataKey.isBlank(),
            "alphavantageKeySet", alphaVantageKey != null && !alphaVantageKey.isBlank(),
            "finnhubKeySet", finnhubKey != null && !finnhubKey.isBlank()
        ));
    }
}
