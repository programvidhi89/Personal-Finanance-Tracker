package com.example.backend.controller;

import com.example.backend.model.Budget;
import com.example.backend.model.User;
import com.example.backend.repository.BudgetRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {
    
    private final BudgetRepository repository;
    private final UserRepository userRepository;

    public BudgetController(BudgetRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    private Long getUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        return user != null ? user.getId() : null;
    }

    @GetMapping
    public List<Budget> getBudgets() {
        Long userId = getUserId();
        if (userId == null) return Collections.emptyList();
        return repository.findAllByUserId(userId);
    }

    @PostMapping
    public Budget createBudget(@RequestBody Budget budget) {
        Long userId = getUserId();
        budget.setUserId(userId);
        repository.save(budget);
        return budget;
    }
}
