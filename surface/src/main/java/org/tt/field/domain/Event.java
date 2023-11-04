package org.tt.field.domain;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.json.JSONObject;
import org.tt.field.utils.TimeUtils;

/**
 * Mission event entity.
 * 
 * @author terratenff
 */
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

    public Event(JSONObject event) {
        this.id = event.getLong("id");
        this.timestamp = TimeUtils.toTimestamp(event.getString("timestamp"));
        this.description = event.getString("description");
    }

    public String toJson() {
        JSONObject json = new JSONObject();
        json.put("id", id);
        json.put("description", description);
        json.put("timestamp", timestamp.toString());
        return json.toString();
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

    /**
     * Sets timestamp from a string.
     * @param timestamp ISO_OFFSET_DATE_TIME-formatted timestamp is expected.
     * (Example: 2011-12-03T10:15:30+01:00)
     */
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
