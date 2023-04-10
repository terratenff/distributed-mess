package org.tt.field.domain;

import java.sql.Timestamp;
import java.time.Instant;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

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

    public void setTimestamp(String timeStamp) {
        this.timestamp = Timestamp.valueOf(timeStamp);
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
