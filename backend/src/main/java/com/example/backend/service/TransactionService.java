package com.example.backend.service;

import com.example.backend.model.Summary;
import com.example.backend.model.Transaction;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.AccountRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
    }

    private Long getAuthenticatedUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username);
        return user != null ? user.getId() : null;
    }

    public List<Transaction> getAllTransactions() {
        Long userId = getAuthenticatedUserId();
        if (userId == null) return Collections.emptyList();
        return transactionRepository.findAllByUserId(userId);
    }

    public Transaction getTransactionById(Long id) {
        Long userId = getAuthenticatedUserId();
        if (userId == null) return null;
        return transactionRepository.findByIdAndUserId(id, userId);
    }

    public Transaction addTransaction(Transaction transaction) {
        Long userId = getAuthenticatedUserId();
        if (userId == null) throw new RuntimeException("Unauthorized");
        transaction.setUserId(userId);
        
        transactionRepository.save(transaction);
        
        // Update account balance
        if (transaction.getAccountId() != null) {
            BigDecimal amountChange = transaction.getAmount();
            if ("EXPENSE".equalsIgnoreCase(transaction.getType())) {
                amountChange = amountChange.negate();
            }
            accountRepository.updateBalance(transaction.getAccountId(), userId, amountChange);
        }
        
        return transaction;
    }

    public void deleteTransaction(Long id) {
        Long userId = getAuthenticatedUserId();
        if (userId != null) {
            Transaction oldTx = transactionRepository.findByIdAndUserId(id, userId);
            if (oldTx != null && oldTx.getAccountId() != null) {
                // Reverse the old transaction from account balance
                BigDecimal oldAmountChange = oldTx.getAmount();
                if ("EXPENSE".equalsIgnoreCase(oldTx.getType())) {
                    oldAmountChange = oldAmountChange.negate();
                }
                // Subtract old amount
                accountRepository.updateBalance(oldTx.getAccountId(), userId, oldAmountChange.negate());
            }
            transactionRepository.deleteByIdAndUserId(id, userId);
        }
    }

    public Transaction updateTransaction(Long id, Transaction newTransaction) {
        Long userId = getAuthenticatedUserId();
        if (userId == null) throw new RuntimeException("Unauthorized");
        
        Transaction oldTx = transactionRepository.findByIdAndUserId(id, userId);
        if (oldTx == null) throw new RuntimeException("Transaction not found");

        // Reverse old transaction balance
        if (oldTx.getAccountId() != null) {
            BigDecimal oldAmountChange = oldTx.getAmount();
            if ("EXPENSE".equalsIgnoreCase(oldTx.getType())) {
                oldAmountChange = oldAmountChange.negate();
            }
            accountRepository.updateBalance(oldTx.getAccountId(), userId, oldAmountChange.negate());
        }

        newTransaction.setId(id);
        newTransaction.setUserId(userId);
        transactionRepository.update(newTransaction);

        // Apply new transaction balance
        if (newTransaction.getAccountId() != null) {
            BigDecimal newAmountChange = newTransaction.getAmount();
            if ("EXPENSE".equalsIgnoreCase(newTransaction.getType())) {
                newAmountChange = newAmountChange.negate();
            }
            accountRepository.updateBalance(newTransaction.getAccountId(), userId, newAmountChange);
        }

        return newTransaction;
    }

    public Summary getSummary() {
        List<Transaction> transactions = getAllTransactions();
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if ("EXPENSE".equalsIgnoreCase(t.getType())) {
                totalExpenses = totalExpenses.add(t.getAmount());
            }
        }

        BigDecimal savings = totalIncome.subtract(totalExpenses);
        return new Summary(totalIncome, totalExpenses, savings);
    }
}
