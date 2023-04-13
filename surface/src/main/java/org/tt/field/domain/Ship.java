package org.tt.field.domain;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.MapsId;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@Table(name = "ship")
public class Ship {

    private static final int NAME_LIMIT = 50;
    private static final int CONDITION_LIMIT = 500;
    
    @Id
    @GeneratedValue
    private Long id;

    @OneToOne(cascade = CascadeType.ALL, optional = true)
    @JoinColumn(nullable = true)
    private Mission mission;

    @OneToMany(cascade = CascadeType.PERSIST)
    @MapsId("id")
    private List<Log> logs;

    private String name;
    private String status;
    private int condition;
    private int peakCondition;

    public Ship() {}

    public Ship(Mission mission, List<Log> logs, String name, String status, int condition, int peakCondition) {
        this.mission = mission;
        this.logs = logs;
        this.name = name;
        this.status = status;
        this.condition = condition;
        this.peakCondition = peakCondition;

        validate();
    }

    private void validate() {
        if (condition > peakCondition || peakCondition > CONDITION_LIMIT) {
            throw new RuntimeException("Condition limits are broken.");
        }
        if (name.length() > NAME_LIMIT) {
            throw new RuntimeException("Name character limit exceeded.");
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Mission getMission() {
        return mission;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
    }

    public List<Log> getLogs() {
        return logs;
    }

    public void setLogs(List<Log> logs) {
        this.logs = logs;
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
        validate();
    }

    public int getPeakCondition() {
        return peakCondition;
    }
    
    public void setPeakCondition(int peakCondition) {
        this.peakCondition = peakCondition;
        validate();
    }
}
