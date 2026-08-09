package com.example.backend.job;

import com.example.backend.model.Budget;
import com.example.backend.model.Transaction;
import com.example.backend.model.User;
import com.example.backend.repository.BudgetRepository;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.EmailService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BudgetAlertJob {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final JdbcTemplate jdbcTemplate;
    private final EmailService emailService;

    public BudgetAlertJob(BudgetRepository budgetRepository, 
                          TransactionRepository transactionRepository,
                          JdbcTemplate jdbcTemplate, 
                          EmailService emailService) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.emailService = emailService;
    }

    // Run every day at 10 AM. Using fixedRate for demo purposes (every 24 hours).
    @Scheduled(fixedRate = 86400000) 
    public void checkBudgetAlerts() {
        System.out.println("Running Budget Alert Job...");
        String currentMonthYear = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        // Get all users
        String sql = "SELECT * FROM users";
        RowMapper<User> userMapper = (ResultSet rs, int rowNum) -> {
            User u = new User();
            u.setId(rs.getLong("id"));
            u.setUsername(rs.getString("username"));
            u.setEmail(rs.getString("email"));
            return u;
        };
        List<User> users = jdbcTemplate.query(sql, userMapper);

        for (User user : users) {
            List<Budget> budgets = budgetRepository.findAllByUserId(user.getId());
            List<Transaction> allTransactions = transactionRepository.findAllByUserId(user.getId());

            // Filter current month expenses
            List<Transaction> currentMonthExpenses = allTransactions.stream()
                    .filter(t -> "EXPENSE".equals(t.getType()) && t.getTransactionDate().toString().startsWith(currentMonthYear))
                    .collect(Collectors.toList());

            for (Budget budget : budgets) {
                // Sum expenses for this category
                BigDecimal spent = currentMonthExpenses.stream()
                        .filter(t -> t.getCategory().equalsIgnoreCase(budget.getCategory()))
                        .map(Transaction::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Check if spent >= 80% of budget
                BigDecimal limit80 = budget.getAmount().multiply(new BigDecimal("0.80"));
                if (spent.compareTo(limit80) >= 0) {
                    double percentage = spent.doubleValue() / budget.getAmount().doubleValue() * 100;
                    
                    String subject = "⚠️ Budget Alert: " + budget.getCategory();
                    String message = String.format("Hello %s,\n\nYou have used %.0f%% of your %s budget.\nLimit: ₹%.2f\nSpent: ₹%.2f\n\nPlease review your spending.",
                            user.getUsername(), percentage, budget.getCategory(), budget.getAmount(), spent);

                    emailService.sendSimpleMessage(user.getEmail(), subject, message);
                }
            }
        }
    }
}
