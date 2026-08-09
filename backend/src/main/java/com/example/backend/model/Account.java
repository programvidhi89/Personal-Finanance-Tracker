package com.example.backend.model;

import java.math.BigDecimal;

public class Account {
    private Long id;
    private Long userId;
    private String name;
    private BigDecimal balance;
    private String type; // 'BANK', 'CASH', 'CREDIT'

    public Account() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
