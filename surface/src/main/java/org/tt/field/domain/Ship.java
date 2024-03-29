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
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Ship entity, the core entity of the application.
 * 
 * @author terratenff
 */
@Entity
@Table(name = "ship")
public class Ship {
    
    @Id
    @GeneratedValue
    private Long id;

    @OneToOne(cascade = CascadeType.ALL, optional = true)
    @JoinColumn(nullable = true)
    private Mission mission;

    @OneToMany(cascade = CascadeType.PERSIST, fetch = FetchType.EAGER)
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

    public Ship(JSONObject ship) {
        this.id = ship.getLong("id");
        this.name = ship.getString("name");
        this.status = ship.getString("status");
        this.condition = ship.getInt("condition");
        this.description = ship.getString("description");
        this.mission = new Mission(ship.getJSONObject("mission"));

        this.logs = new ArrayList<>();
        JSONArray logsJson = ship.getJSONArray("logs");
        for (int i = 0; i < logsJson.length(); i++) {
            this.logs.add(new Log(logsJson.getJSONObject(i)));
        }
    }

    public String toJson() {
        JSONObject json = new JSONObject();
        json.put("id", id);
        json.put("name", name);
        json.put("status", status);
        json.put("condition", condition);
        json.put("peakCondition", peakCondition);
        json.put("description", description);
        json.put("mission", new JSONObject(mission.toJson()));

        JSONArray array = new JSONArray();
        for (Log log : logs) {
           array.put(new JSONObject(log.toJson()));
        }
        json.put("logs", array);
        
        return json.toString();
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Ship)) {
            return false;
        } else {
            Ship other = (Ship) obj;
            return this.id.equals(other.id);
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
