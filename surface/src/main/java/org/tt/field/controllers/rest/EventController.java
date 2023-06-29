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
import org.tt.field.domain.Event;
import org.tt.field.repository.EventRepository;

/**
 * API controller class for the handling of event entities.
 * 
 * @author terratenff
 */
@RestController
@RequestMapping("/events")
public class EventController {
    private final EventRepository eventRepository;

    private static Logger logger = LoggerFactory.getLogger(EventController.class);

    public EventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    /**
     * Getter for event entities.
     * @param pageStr Optional page number. If provided, limited set of events are returned (examples:
     * 0 = 1-10, 1 = 11-20, 2 = 21-30). If not provided, all events are returned.
     * @return Either all events, or 10 events in a paginated manner. In the event of a parsing error,
     * all events are returned.
     */
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

    /**
     * @param id Event ID.
     * @return Event with specified ID.
     */
    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return eventRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    /**
     * Adds an event entity. However, it won't be associated with a mission entity.
     * @param event Event entity to be added.
     * @return Return value for getting added event.
     * @throws URISyntaxException
     */
    @PostMapping
    public ResponseEntity createEvent(@RequestBody Event event) throws URISyntaxException {

        if (!EntityValidation.validateEvent(event)) {
            logger.error("Event creation was aborted.");
            return ResponseEntity.badRequest().build();
        }

        logger.info("An event was added.");
        Event savedEvent = eventRepository.save(event);

        return ResponseEntity.created(new URI("/events/" + savedEvent.getId())).body(savedEvent);
    }

    /**
     * Edits existing event entity.
     * @param id Event ID.
     * @param event Event entity that replaces target event entity.
     * @return ok.
     */
    @PutMapping("/{id}")
    public ResponseEntity updateEvent(@PathVariable Long id, @RequestBody Event event) {

        if (!EntityValidation.validateEvent(event)) {
            logger.error("Event creation was aborted.");
            return ResponseEntity.badRequest().build();
        }

        Event currentEvent = eventRepository.findById(id).orElse(null);
        if (currentEvent == null) {
            logger.error("Event with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("An event was edited.");

        currentEvent.setTimestamp(event.getTimestamp());
        currentEvent.setDescription(event.getDescription());
        currentEvent = eventRepository.save(event);

        return ResponseEntity.ok(currentEvent);
    }

    /**
     * Deletes existing event entity.
     * @param id Event ID.
     * @return ok.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity deleteEvent(@PathVariable Long id) {

        Event event = eventRepository.findById(id).orElse(null);
        if (event == null) {
            logger.warn("Event with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("An event was deleted.");
        eventRepository.deleteById(id);

        return ResponseEntity.ok().build();
    }
}
