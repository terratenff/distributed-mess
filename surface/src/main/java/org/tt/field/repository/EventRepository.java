package org.tt.field.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tt.field.domain.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
    
}
