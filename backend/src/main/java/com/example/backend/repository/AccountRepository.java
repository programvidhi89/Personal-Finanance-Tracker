package com.example.backend.repository;

import com.example.backend.model.Account;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.util.List;

@Repository
public class AccountRepository {
    private final JdbcTemplate jdbcTemplate;

    public AccountRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Account> rowMapper = (ResultSet rs, int rowNum) -> {
        Account a = new Account();
        a.setId(rs.getLong("id"));
        a.setUserId(rs.getLong("user_id"));
        a.setName(rs.getString("name"));
        a.setBalance(rs.getBigDecimal("balance"));
        a.setType(rs.getString("type"));
        return a;
    };

    public List<Account> findAllByUserId(Long userId) {
        String sql = "SELECT * FROM accounts WHERE user_id = ?";
        return jdbcTemplate.query(sql, rowMapper, userId);
    }

    public Account findByIdAndUserId(Long id, Long userId) {
        String sql = "SELECT * FROM accounts WHERE id = ? AND user_id = ?";
        List<Account> result = jdbcTemplate.query(sql, rowMapper, id, userId);
        return result.isEmpty() ? null : result.get(0);
    }

    public int save(Account account) {
        String sql = "INSERT INTO accounts (user_id, name, balance, type) VALUES (?, ?, ?, ?)";
        return jdbcTemplate.update(sql, account.getUserId(), account.getName(), account.getBalance(), account.getType());
    }

    public int updateBalance(Long id, Long userId, java.math.BigDecimal amountChange) {
        String sql = "UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?";
        return jdbcTemplate.update(sql, amountChange, id, userId);
    }

    public int updateAccount(Account account) {
        String sql = "UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ? AND user_id = ?";
        return jdbcTemplate.update(sql, account.getName(), account.getType(), account.getBalance(), account.getId(), account.getUserId());
    }
}
