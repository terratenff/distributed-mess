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
import org.tt.field.domain.Event;
import org.tt.field.repository.EventRepository;

@RestController
@RequestMapping("/events")
public class EventController {
    private final EventRepository eventRepository;

    private static Logger logger = LoggerFactory.getLogger(EventController.class);

    public EventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @GetMapping
    public List<Event> getEvents(@RequestParam(name = "page", required = false) String pageStr) {
        if (pageStr == null) {
            return eventRepository.findAll();
        } else {
            try {
                final int limit = 10;
                final int page = Integer.parseInt(pageStr);
                return eventRepository.findEvents(limit, limit * page);
            } catch (NumberFormatException e) {
                return List.of();
            }
        }
    }

    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return eventRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @PostMapping
    public ResponseEntity createEvent(@RequestBody Event event) throws URISyntaxException {
        logger.info("An event was added.");

        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.created(new URI("/events/" + savedEvent.getId())).body(savedEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateEvent(@PathVariable Long id, @RequestBody Event event) {
        logger.info("An event was edited.");

        Event currentEvent = eventRepository.findById(id).orElseThrow(RuntimeException::new);
        currentEvent.setTimestamp(event.getTimestamp());
        currentEvent.setDescription(event.getDescription());
        currentEvent = eventRepository.save(event);

        return ResponseEntity.ok(currentEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteEvent(@PathVariable Long id) {
        logger.info("An event was deleted.");

        eventRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
