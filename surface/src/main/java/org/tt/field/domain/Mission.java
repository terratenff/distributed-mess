package org.tt.field.domain;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MapsId;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "mission")
public class Mission {
    
    @Id
    @GeneratedValue
    private Long id;

    private String title;
    private String objective;
    private String description;
    private boolean completed = false;

    private double centerX, centerY, centerZ;
    private double radius;

    private Timestamp departureTime = Timestamp.from(Instant.now());
    private Timestamp arrivalTime = Timestamp.from(Instant.now());
    private String currentDestination;

    @OneToMany(cascade = CascadeType.ALL)
    @MapsId("id")
    private List<Event> events = new ArrayList<Event>();

    public Mission() {}

    public Mission(String title, String objective, String description, boolean completed, double centerX, double centerY, double centerZ,
            double radius, Timestamp departureTime, Timestamp arrivalTime, String currentDestination, List<Event> events) {
        this.title = title;
        this.objective = objective;
        this.description = description;
        this.completed = completed;
        this.centerX = centerX;
        this.centerY = centerY;
        this.centerZ = centerZ;
        this.radius = radius;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.currentDestination = currentDestination;
        this.events = events;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getObjective() {
        return objective;
    }

    public void setObjective(String objective) {
        this.objective = objective;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean getCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public double getCenterX() {
        return centerX;
    }

    public void setCenterX(double centerX) {
        this.centerX = centerX;
    }

    public double getCenterY() {
        return centerY;
    }

    public void setCenterY(double centerY) {
        this.centerY = centerY;
    }

    public double getCenterZ() {
        return centerZ;
    }

    public void setCenterZ(double centerZ) {
        this.centerZ = centerZ;
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }

    public Timestamp getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(Timestamp departureTime) {
        this.departureTime = departureTime;
    }

    public Timestamp getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(Timestamp arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public void setDepartureTime(String departureTime) {
        if (departureTime == null || departureTime.equals("null")) {
            this.departureTime = null;
        } else {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
            LocalDateTime time = LocalDateTime.parse(departureTime, formatter);
            this.departureTime = Timestamp.valueOf(time);
        }
    }

    public String getCurrentDestination() {
        return currentDestination;
    }

    public void setCurrentDestination(String currentDestination) {
        this.currentDestination = currentDestination;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }
}
