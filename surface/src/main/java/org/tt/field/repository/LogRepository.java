package org.tt.field.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.tt.field.domain.Log;

public interface LogRepository extends JpaRepository<Log, Long> {
    
    @Query(value = "SELECT * FROM log LIMIT ?1 OFFSET ?2", nativeQuery = true)
    List<Log> findLogs(Integer limit, Integer offset);
}
