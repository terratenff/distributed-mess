package org.tt.field.domain;

import java.sql.Timestamp;
import java.time.Instant;
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
@Table(name = "status")
public class Mission {
    
    @Id
    @GeneratedValue
    private Long id;

    private Timestamp departureTime = Timestamp.from(Instant.now());
    private String currentDestination;
    private double flightTime;

    @OneToMany(cascade = CascadeType.ALL)
    @MapsId("id")
    private List<Event> events = new ArrayList<Event>();

    public Mission() {}

    public Mission(Timestamp departureTime, String currentDestination, double flightTime,
            List<Event> events) {
        this.departureTime = departureTime;
        this.currentDestination = currentDestination;
        this.flightTime = flightTime;
        this.events = events;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Timestamp getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(Timestamp departureTime) {
        this.departureTime = departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = Timestamp.valueOf(departureTime);
    }

    public String getCurrentDestination() {
        return currentDestination;
    }

    public void setCurrentDestination(String currentDestination) {
        this.currentDestination = currentDestination;
    }

    public double getFlightTime() {
        return flightTime;
    }

    public void setFlightTime(double flightTime) {
        this.flightTime = flightTime;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }
}
