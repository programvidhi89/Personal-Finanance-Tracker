package com.example.backend.controller;

import com.example.backend.model.SavingsGoal;
import com.example.backend.model.User;
import com.example.backend.repository.SavingsGoalRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Collections;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class SavingsGoalController {

    private final SavingsGoalRepository repository;
    private final UserRepository userRepository;

    public SavingsGoalController(SavingsGoalRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    private Long getUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        return user != null ? user.getId() : null;
    }

    @GetMapping
    public List<SavingsGoal> getGoals() {
        Long userId = getUserId();
        if (userId == null) return Collections.emptyList();
        return repository.findAllByUserId(userId);
    }

    @PostMapping
    public SavingsGoal createGoal(@RequestBody SavingsGoal goal) {
        Long userId = getUserId();
        goal.setUserId(userId);
        if(goal.getSavedAmount() == null) goal.setSavedAmount(BigDecimal.ZERO);
        repository.save(goal);
        return goal;
    }

    @PostMapping("/{id}/add")
    public void addToGoal(@PathVariable Long id, @RequestParam BigDecimal amount) {
        Long userId = getUserId();
        if (userId != null) {
            repository.updateSavedAmount(id, userId, amount);
        }
    }
}
