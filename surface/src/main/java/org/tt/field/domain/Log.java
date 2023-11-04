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
 * Ship log entity.
 * 
 * @author terratenff
 */
@Entity
@Table(name = "log")
public class Log {
    
    @Id
    @GeneratedValue
    private Long id;

    private Timestamp timestamp = Timestamp.from(Instant.now());
    private String description;

    public Log() {}

    public Log(Timestamp timestamp, String description) {
        this.timestamp = timestamp;
        this.description = description;
    }

    public Log(JSONObject log) {
        this.id = log.getLong("id");
        this.timestamp = TimeUtils.toTimestamp(log.getString("timestamp"));
        this.description = log.getString("description");
    }

    public String toJson() {
        return toJsonObject().toString();
    }

    public JSONObject toJsonObject() {
        JSONObject json = new JSONObject();
        json.put("id", id);
        json.put("description", description);
        json.put("timestamp", timestamp.toString());
        return json;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Timestamp getTimestamp() {
        return timestamp;
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
