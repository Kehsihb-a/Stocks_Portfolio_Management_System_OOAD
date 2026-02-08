package com.example.backend.controller;

import com.example.backend.model.Transaction;
import com.example.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:3001",
    "https://stock-portfolio-frontend.onrender.com"
})
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping("/buy")
    public ResponseEntity<?> buyStock(@RequestBody Map<String, Object> request) {
        try {
            String symbol = parseRequiredString(request, "symbol");
            double quantity = parseRequiredDouble(request, "quantity");
            double price = parseRequiredDouble(request, "price");
            
            Transaction transaction = transactionService.buyStock(symbol, quantity, price);
            return ResponseEntity.ok(Map.of(
                "transaction", transaction,
                "user", transaction.getUser()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/sell")
    public ResponseEntity<?> sellStock(@RequestBody Map<String, Object> request) {
        try {
            String symbol = parseRequiredString(request, "symbol");
            double quantity = parseRequiredDouble(request, "quantity");
            double price = parseRequiredDouble(request, "price");
            
            Transaction transaction = transactionService.sellStock(symbol, quantity, price);
            return ResponseEntity.ok(Map.of(
                "transaction", transaction,
                "user", transaction.getUser()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getUserTransactions() {
        return ResponseEntity.ok(transactionService.getUserTransactions());
    }

    private static String parseRequiredString(Map<String, Object> request, String key) {
        Object value = request.get(key);
        if (value == null) {
            throw new RuntimeException("Missing field: " + key);
        }
        String result = value.toString().trim();
        if (result.isEmpty()) {
            throw new RuntimeException("Missing field: " + key);
        }
        return result;
    }

    private static double parseRequiredDouble(Map<String, Object> request, String key) {
        Object value = request.get(key);
        if (value == null) {
            throw new RuntimeException("Missing field: " + key);
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid number for: " + key);
        }
    }
}
