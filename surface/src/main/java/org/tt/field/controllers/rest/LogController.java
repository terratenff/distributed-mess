package org.tt.field.controllers.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.tt.field.core.EntityValidation;
import org.tt.field.domain.Log;
import org.tt.field.repository.LogRepository;

/**
 * API controller class for the handling of log entities.
 * 
 * @author terratenff
 */
@RestController
@RequestMapping("/logs")
public class LogController {
    private final LogRepository logRepository;

    private static Logger logger = LoggerFactory.getLogger(LogController.class);

    public LogController(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    /**
     * Getter for log entities.
     * @param pageStr Optional page number. If provided, limited set of logs are returned (examples:
     * 0 = 1-10, 1 = 11-20, 2 = 21-30). If not provided, all logs are returned.
     * @return Either all logs, or 10 logs in a paginated manner. In the event of a parsing error,
     * all logs are returned.
     */
    @GetMapping
    public List<Log> getLogs(@RequestParam(name = "page", required = false) String pageStr) {
        if (pageStr == null) {
            return logRepository.findAll();
        } else {
            try {
                final int limit = 10;
                final int page = Integer.parseInt(pageStr);
                return logRepository.findLogs(limit, limit * page);
            } catch (NumberFormatException e) {
                return List.of();
            }
        }
    }

    /**
     * @param id Log ID.
     * @return Log with specified ID.
     */
    @GetMapping("/{id}")
    public Log getLog(@PathVariable Long id) {
        return logRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    /**
     * Adds a log entity. However, it won't be associated with a ship entity.
     * @param log Log entity to be added.
     * @return Return value for getting added log.
     * @throws URISyntaxException
     */
    @PostMapping
    public ResponseEntity createLog(@RequestBody Log log) throws URISyntaxException {

        if (!EntityValidation.validateLog(log)) {
            logger.error("Log creation was aborted.");
            return ResponseEntity.badRequest().build();
        }

        logger.info("A log was added.");

        Log savedLog = logRepository.save(log);
        return ResponseEntity.created(new URI("/logs/" + savedLog.getId())).body(savedLog);
    }

    /**
     * Edits existing log entity.
     * @param id Log ID.
     * @param log Log entity that replaces target log entity.
     * @return ok.
     */
    @PutMapping("/{id}")
    public ResponseEntity updateLog(@PathVariable Long id, @RequestBody Log log) {

        if (!EntityValidation.validateLog(log)) {
            logger.error("Log editing was aborted.");
            return ResponseEntity.badRequest().build();
        }

        Log currentLog = logRepository.findById(id).orElse(null);
        if (currentLog == null) {
            logger.error("Log with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("A log was edited.");

        currentLog.setTimestamp(log.getTimestamp());
        currentLog.setDescription(log.getDescription());
        currentLog = logRepository.save(log);

        return ResponseEntity.ok(currentLog);
    }

    /**
     * Deletes existing log entity.
     * @param id Log ID.
     * @return ok.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity deleteLog(@PathVariable Long id) {

        Log log = logRepository.findById(id).orElse(null);
        if (log == null) {
            logger.warn("Log with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("A log was deleted.");
        logRepository.deleteById(id);
        
        return ResponseEntity.ok().build();
    }
}

