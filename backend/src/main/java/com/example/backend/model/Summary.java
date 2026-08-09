package com.example.backend.model;

import java.math.BigDecimal;

public class Summary {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal savings;

    public Summary() {}

    public Summary(BigDecimal totalIncome, BigDecimal totalExpenses, BigDecimal savings) {
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.savings = savings;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome != null ? totalIncome : BigDecimal.ZERO;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses != null ? totalExpenses : BigDecimal.ZERO;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getSavings() {
        return savings != null ? savings : BigDecimal.ZERO;
    }

    public void setSavings(BigDecimal savings) {
        this.savings = savings;
    }
}
