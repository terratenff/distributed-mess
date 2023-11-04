package org.tt.field.controllers.rest;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.tt.field.domain.Event;
import org.tt.field.domain.Log;
import org.tt.field.domain.Mission;
import org.tt.field.domain.Ship;
import org.tt.field.utils.HttpUtils;

/**
 * API controller class for fetching entities that are situated in
 * the "space" module.
 * 
 * @author terratenff
 */
@RestController
@RequestMapping("/space")
public class SpaceController {
    
    public SpaceController() {}

    @GetMapping("/ships")
    public List<Ship> getShips(@RequestParam(name = "page", defaultValue = "all") String page) {
        return createShipsFromJson(HttpUtils.getShips("?page=" + page));
    }

    @GetMapping("/logs")
    public List<Log> getLogs(@RequestParam(name = "page", defaultValue = "all") String page) {
        return createLogsFromJson(HttpUtils.getLogs("?page=" + page));
    }

    @GetMapping("/missions")
    public List<Mission> getMissions(@RequestParam(name = "page", defaultValue = "all") String page) {
        return createMissionsFromJson(HttpUtils.getMissions("?page=" + page));
    }

    @GetMapping("/events")
    public List<Event> getEvents(@RequestParam(name = "page", defaultValue = "all") String page) {
        return createEventsFromJson(HttpUtils.getEvents("?page=" + page));
    }

    private List<Ship> createShipsFromJson(JSONObject shipsJson) {
        List<Ship> ships = new ArrayList<>();
        if (shipsJson != null) {
            for (String shipId : shipsJson.keySet()) {
                JSONObject shipJson = shipsJson.getJSONObject(shipId);
                Ship ship = new Ship(shipJson);
                ships.add(ship);
            }
        }
        return ships;
    }

    private List<Log> createLogsFromJson(JSONArray logsJson) {
        List<Log> logs = new ArrayList<>();
        if (logsJson != null) {
            for (int i = 0; i < logsJson.length(); i++) {
                JSONObject logJson = logsJson.getJSONObject(i);
                Log log = new Log(logJson);
                logs.add(log);
            }
        }
        return logs;
    }

    private List<Mission> createMissionsFromJson(JSONArray missionsJson) {
        List<Mission> missions = new ArrayList<>();
        if (missionsJson != null) {
            for (int i = 0; i < missionsJson.length(); i++) {
                JSONObject missionJson = missionsJson.getJSONObject(i);
                Mission mission = new Mission(missionJson);
                missions.add(mission);
            }
        }
        return missions;
    }

    private List<Event> createEventsFromJson(JSONArray eventsJson) {
        List<Event> events = new ArrayList<>();
        if (eventsJson != null) {
            for (int i = 0; i < eventsJson.length(); i++) {
                JSONObject eventJson = eventsJson.getJSONObject(i);
                Event event = new Event(eventJson);
                events.add(event);
            }
        }
        return events;
    }
}
