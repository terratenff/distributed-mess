package org.tt.field.controllers.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RestController;
import org.tt.field.domain.Event;
import org.tt.field.domain.Mission;
import org.tt.field.repository.EventRepository;
import org.tt.field.repository.MissionRepository;

@RestController
@RequestMapping("/missions")
public class MissionController {
    private final MissionRepository missionRepository;
    private final EventRepository eventRepository;

    private static Logger logger = LoggerFactory.getLogger(MissionController.class);

    public MissionController(MissionRepository missionRepository, EventRepository eventRepository) {
        this.missionRepository = missionRepository;
        this.eventRepository = eventRepository;
    }
    
    @GetMapping
    public List<Mission> getMissions() {
        return missionRepository.findAll();
    }

    @GetMapping("/{id}")
    public Mission getMission(@PathVariable Long id) {
        return missionRepository.findById(id).orElseThrow(RuntimeException::new);
    }

    @PostMapping
    public ResponseEntity createMission(@RequestBody Mission mission) throws URISyntaxException {
        logger.info("A mission was added.");

        Mission savedMission = missionRepository.save(mission);
        return ResponseEntity.created(new URI("/missions/" + savedMission.getId())).body(savedMission);
    }

    @PutMapping("/{id}")
    public ResponseEntity updateMission(@PathVariable Long id, @RequestBody Mission mission) {
        logger.info("A mission was edited.");

        Mission currentMission = missionRepository.findById(id).orElseThrow(RuntimeException::new);
        currentMission.setObjective(mission.getObjective());
        currentMission.setDescription(mission.getDescription());
        currentMission.setCenterX(mission.getCenterX());
        currentMission.setCenterY(mission.getCenterY());
        currentMission.setCenterZ(mission.getCenterZ());
        currentMission.setRadius(mission.getRadius());
        currentMission.setCurrentDestination(mission.getCurrentDestination());
        currentMission.setDepartureTime(mission.getDepartureTime());
        currentMission.setFlightTime(mission.getFlightTime());
        currentMission = missionRepository.save(mission);

        return ResponseEntity.ok(currentMission);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deleteMission(@PathVariable Long id) {
        logger.info("A mission was deleted.");
        
        missionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/events")
    public ResponseEntity createEventForMission(@PathVariable Long id, @RequestBody Map<String, String> eventData) {
        Mission mission = missionRepository.findById(id).orElse(null);
        if (mission == null) {
            logger.error("Mission with ID " + id + " not found.");
            return ResponseEntity.notFound().build();
        }

        logger.info("An event was created for a mission.");

        Event event = new Event(Timestamp.from(Instant.now()), eventData.get("description"));
        event = eventRepository.save(event);

        List<Event> events = mission.getEvents();
        events.add(event);
        mission.setEvents(events);
        missionRepository.save(mission);

        return ResponseEntity.ok().build();
    }
}
