package com.example.backend.repository;

import com.example.backend.model.SavingsGoal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.util.List;

@Repository
public class SavingsGoalRepository {
    private final JdbcTemplate jdbcTemplate;

    public SavingsGoalRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<SavingsGoal> rowMapper = (ResultSet rs, int rowNum) -> {
        SavingsGoal goal = new SavingsGoal();
        goal.setId(rs.getLong("id"));
        goal.setUserId(rs.getLong("user_id"));
        goal.setName(rs.getString("name"));
        goal.setTargetAmount(rs.getBigDecimal("target_amount"));
        goal.setSavedAmount(rs.getBigDecimal("saved_amount"));
        if(rs.getDate("deadline") != null) {
            goal.setDeadline(rs.getDate("deadline").toLocalDate());
        }
        return goal;
    };

    public List<SavingsGoal> findAllByUserId(Long userId) {
        String sql = "SELECT * FROM savings_goals WHERE user_id = ?";
        return jdbcTemplate.query(sql, rowMapper, userId);
    }

    public int save(SavingsGoal goal) {
        String sql = "INSERT INTO savings_goals (user_id, name, target_amount, saved_amount, deadline) VALUES (?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql, goal.getUserId(), goal.getName(), goal.getTargetAmount(), goal.getSavedAmount(), goal.getDeadline());
    }

    public int updateSavedAmount(Long id, Long userId, java.math.BigDecimal amountToAdd) {
        String sql = "UPDATE savings_goals SET saved_amount = saved_amount + ? WHERE id = ? AND user_id = ?";
        return jdbcTemplate.update(sql, amountToAdd, id, userId);
    }
}
