package com.example.backend.repository;

import com.example.backend.model.Transaction;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class TransactionRepository {

    private final JdbcTemplate jdbcTemplate;

    public TransactionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Transaction> transactionRowMapper = (ResultSet rs, int rowNum) -> {
        Transaction t = new Transaction();
        t.setId(rs.getLong("id"));
        t.setUserId(rs.getLong("user_id"));
        
        long accountId = rs.getLong("account_id");
        if (!rs.wasNull()) {
            t.setAccountId(accountId);
        }

        t.setAmount(rs.getBigDecimal("amount"));
        t.setCategory(rs.getString("category"));
        t.setTransactionDate(rs.getDate("transaction_date").toLocalDate());
        t.setDescription(rs.getString("description"));
        t.setType(rs.getString("type"));
        return t;
    };

    public List<Transaction> findAllByUserId(Long userId) {
        String sql = "SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC";
        return jdbcTemplate.query(sql, transactionRowMapper, userId);
    }

    public Transaction findByIdAndUserId(Long id, Long userId) {
        String sql = "SELECT * FROM transactions WHERE id = ? AND user_id = ?";
        List<Transaction> result = jdbcTemplate.query(sql, transactionRowMapper, id, userId);
        return result.isEmpty() ? null : result.get(0);
    }

    public int save(Transaction transaction) {
        String sql = "INSERT INTO transactions (user_id, account_id, amount, category, transaction_date, description, type) VALUES (?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql, 
                transaction.getUserId(), 
                transaction.getAccountId(),
                transaction.getAmount(), 
                transaction.getCategory(), 
                transaction.getTransactionDate(), 
                transaction.getDescription(), 
                transaction.getType());
    }

    public int deleteByIdAndUserId(Long id, Long userId) {
        String sql = "DELETE FROM transactions WHERE id = ? AND user_id = ?";
        return jdbcTemplate.update(sql, id, userId);
    }

    public int update(Transaction transaction) {
        String sql = "UPDATE transactions SET account_id = ?, amount = ?, category = ?, transaction_date = ?, description = ?, type = ? WHERE id = ? AND user_id = ?";
        return jdbcTemplate.update(sql, 
                transaction.getAccountId(),
                transaction.getAmount(), 
                transaction.getCategory(), 
                transaction.getTransactionDate(), 
                transaction.getDescription(), 
                transaction.getType(),
                transaction.getId(),
                transaction.getUserId());
    }
}
