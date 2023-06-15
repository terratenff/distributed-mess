package org.tt.field.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.tt.field.domain.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
    
    @Query(value = "SELECT * FROM event LIMIT ?1 OFFSET ?2", nativeQuery = true)
    List<Event> findEvents(Integer limit, Integer offset);
}
