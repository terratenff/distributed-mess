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
import org.tt.field.domain.Log;
import org.tt.field.repository.LogRepository;

@RestController
@RequestMapping("/logs")
public class LogController {
    private final LogRepository logRepository;

    private static Logger logger = LoggerFactory.getLogger(LogController.class);

    public LogController(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

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

    @GetMapping("/{id}")
    public Log getLog(@PathVariable Long id) {
        return logRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @PostMapping
    public ResponseEntity createLog(@RequestBody Log log) throws URISyntaxException {
        logger.info("A log was added.");

        Log savedLog = logRepository.save(log);
        return ResponseEntity.created(new URI("/logs/" + savedLog.getId())).body(savedLog);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateLog(@PathVariable Long id, @RequestBody Log log) {
        logger.info("A log was edited.");

        Log currentLog = logRepository.findById(id).orElseThrow(RuntimeException::new);
        currentLog.setTimestamp(log.getTimestamp());
        currentLog.setDescription(log.getDescription());
        currentLog = logRepository.save(log);

        return ResponseEntity.ok(currentLog);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteLog(@PathVariable Long id) {
        logger.info("A log was deleted.");

        logRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

