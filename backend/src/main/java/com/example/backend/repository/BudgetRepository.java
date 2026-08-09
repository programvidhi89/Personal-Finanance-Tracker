package com.example.backend.repository;

import com.example.backend.model.Budget;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.util.List;

@Repository
public class BudgetRepository {
    private final JdbcTemplate jdbcTemplate;

    public BudgetRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Budget> rowMapper = (ResultSet rs, int rowNum) -> {
        Budget b = new Budget();
        b.setId(rs.getLong("id"));
        b.setUserId(rs.getLong("user_id"));
        b.setCategory(rs.getString("category"));
        b.setAmount(rs.getBigDecimal("amount"));
        b.setMonthYear(rs.getString("month_year"));
        return b;
    };

    public List<Budget> findAllByUserId(Long userId) {
        String sql = "SELECT * FROM budgets WHERE user_id = ?";
        return jdbcTemplate.query(sql, rowMapper, userId);
    }

    public int save(Budget budget) {
        String sql = "INSERT INTO budgets (user_id, category, amount, month_year) VALUES (?, ?, ?, ?)";
        return jdbcTemplate.update(sql, budget.getUserId(), budget.getCategory(), budget.getAmount(), budget.getMonthYear());
    }
}
