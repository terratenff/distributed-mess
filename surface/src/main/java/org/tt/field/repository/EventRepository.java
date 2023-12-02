package org.tt.field.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.tt.field.domain.Event;

/**
 * Repository for mission event entities.
 * 
 * @author terratenff
 */
public interface EventRepository extends JpaRepository<Event, Long> {
    
    /**
     * Queries mission events for pagination purposes.
     * @param limit At most this many mission events are returned.
     * @param offset The first set of mission events are skipped. This determines how many are skipped.
     * @return List of up to <limit> mission events, where first <offset> events are skipped.
     */
    @Query(value = "SELECT * FROM event ORDER BY timestamp DESC LIMIT ?1 OFFSET ?2", nativeQuery = true)
    List<Event> findEvents(Integer limit, Integer offset);
}
