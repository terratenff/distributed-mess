package org.tt.field.domain;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "event")
public class Event {
    
    @Id
    @GeneratedValue
    private Long id;

    private Timestamp timestamp = Timestamp.from(Instant.now());
    private String description;

    public Event() {}

    public Event(Timestamp timestamp, String description) {
        this.timestamp = timestamp;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Timestamp getTimestamp() {
        return this.timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }

    public void setTimestamp(String timestamp) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
        LocalDateTime time = LocalDateTime.parse(timestamp, formatter);
        this.timestamp = Timestamp.valueOf(time);
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
