package org.tt.field.domain;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "ship")
public class Ship {
    
    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String status;
    private int condition;
    private int peakCondition;

    public Ship() {}

    public Ship(String name, String status, int condition, int peakCondition) {
        this.name = name;
        this.status = status;
        this.condition = condition;
        this.peakCondition = peakCondition;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public int getCondition() {
        return condition;
    }
    public void setCondition(int condition) {
        this.condition = condition;
    }
    public int getPeakCondition() {
        return peakCondition;
    }
    public void setPeakCondition(int peakCondition) {
        this.peakCondition = peakCondition;
    }
}
