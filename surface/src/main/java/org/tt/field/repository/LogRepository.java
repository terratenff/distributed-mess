package org.tt.field.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.tt.field.domain.Log;

/**
 * Repository for ship log entities.
 * 
 * @author terratenff
 */
public interface LogRepository extends JpaRepository<Log, Long> {
    
    /**
     * Queries ship logs for pagination purposes.
     * @param limit At most this many ship logs are returned.
     * @param offset The first set of ship logs are skipped. This determines how many are skipped.
     * @return List of up to <limit> ship logs, where first <offset> logs are skipped.
     */
    @Query(value = "SELECT * FROM log LIMIT ?1 OFFSET ?2", nativeQuery = true)
    List<Log> findLogs(Integer limit, Integer offset);
}
