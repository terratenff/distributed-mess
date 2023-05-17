package org.tt.field.domain;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.MapsId;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;

@Entity
@Table(name = "ship")
public class Ship {
    
    @Id
    @GeneratedValue
    private Long id;

    @OneToOne(cascade = CascadeType.ALL, optional = true)
    @JoinColumn(nullable = true)
    private Mission mission;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
    @MapsId("id")
    private List<Mission> pastMissions = new ArrayList<Mission>();

    @OneToMany(cascade = CascadeType.PERSIST)
    @LazyCollection(LazyCollectionOption.FALSE)
    @MapsId("id")
    private List<Log> logs;

    private String name;
    private String status;
    private int condition = -1;
    private int peakCondition = -1;
    private String description;

    public Ship() {}

    public Ship(Mission mission, List<Mission> pastMissions, List<Log> logs, String name, String status, int condition, int peakCondition, String description) {
        this.mission = mission;
        this.pastMissions = pastMissions;
        this.logs = logs;
        this.name = name;
        this.status = status;
        this.condition = condition;
        this.peakCondition = peakCondition;
        this.description = description;
    }

    public boolean equals(Ship other) {
        return this.id.equals(other.id);
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

    public List<Mission> getPastMissions() {
        return pastMissions;
    }

    public void setPastMissions(List<Mission> pastMissions) {
        this.pastMissions = pastMissions;
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
    }

    public int getPeakCondition() {
        return peakCondition;
    }
    
    public void setPeakCondition(int peakCondition) {
        this.peakCondition = peakCondition;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
