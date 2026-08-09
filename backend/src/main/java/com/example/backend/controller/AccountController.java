package com.example.backend.controller;

import com.example.backend.model.Account;
import com.example.backend.model.User;
import com.example.backend.repository.AccountRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountRepository repository;
    private final UserRepository userRepository;

    public AccountController(AccountRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    private Long getUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        return user != null ? user.getId() : null;
    }

    @GetMapping
    public List<Account> getAccounts() {
        Long userId = getUserId();
        if (userId == null) return Collections.emptyList();
        return repository.findAllByUserId(userId);
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        Long userId = getUserId();
        account.setUserId(userId);
        if(account.getBalance() == null) account.setBalance(BigDecimal.ZERO);
        repository.save(account);
        return account;
    }
}
