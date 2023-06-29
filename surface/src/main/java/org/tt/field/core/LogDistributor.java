package org.tt.field.core;

import static java.util.Map.entry;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Log;
import org.tt.field.domain.Ship;

/**
 * Collects and processes log entries for ship entities to use to make ship logs.
 * 
 * @author terratenff
 */
public class LogDistributor {

    private static final Logger logger = LoggerFactory.getLogger(LogDistributor.class);

    /**
     * Collection of file paths where the log entries are collected from.
     */
    private static final Map<String, String> FILE_PATHS = Map.ofEntries(
        entry("dry_dock_flavor", "/core/dry_dock_flavor.txt"),
        entry("dry_dock_finish_flavor", "/core/dry_dock_finish_flavor.txt"),
        entry("landing_flavor", "/core/landing_flavor.txt"),
        entry("landing_broken_flavor", "/core/landing_broken_flavor.txt"),
        entry("landing_crashed_flavor", "/core/landing_crashed_flavor.txt"),
        entry("launch_site_flavor", "/core/launch_site_flavor.txt"),
        entry("launch_site_finish_flavor", "/core/launch_site_finish_flavor.txt"),
        entry("transit_ship_flavor", "/core/transit_ship_flavor.txt")
    );
    
    private static LogDistributor instance;

    /**
     * Getter for the singleton instance.
     * @return LogDistributor.
     */
    public static LogDistributor getInstance() {
        if (instance == null) {
            instance = new LogDistributor();
        }
        return instance;
    }

    /**
     * Data structure for all the ship logs.
     */
    private Map<String, List<String>> flavor;
    private Random random;
    
    /**
     * LogDistributor constructor. Acts as the initializer.
     */
    private LogDistributor() {
        logger.info("Initializing log distributor...");

        flavor = new HashMap<String, List<String>>();
        random = new Random();

        for (Entry<String, String> entry : FILE_PATHS.entrySet()) {
            String key = entry.getKey();
            String filePath = entry.getValue();
            List<String> contents = new ArrayList<String>();

            InputStream stream = getClass().getResourceAsStream(filePath);
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {

                String line = null;
                while ((line = reader.readLine()) != null) {
                    contents.add(line);
                }
                flavor.put(key, contents);

            } catch (IOException e) {
                logger.error("Contents from file '" + filePath + "' could not be read.");
                logger.error(e.getMessage());
            }
        }
    }

    /**
     * Returns a random, unprocessed log entry based on given key.
     * @param key Determines what kind of log entry to return.
     * @return Random, unprocessed log entry. (String)
     */
    public String getFlavor(String key) {
        return flavor.get(key).get(random.nextInt(flavor.get(key).size()));
    }

    /**
     * Generates a random log entry based on given key. It is completed with information about
     * the ship entity that it is associated with.
     * @param ship Ship entity that is associated with the log entry.
     * @param key Determines what kind of log entry to return.
     * @return Random log entry. (Log)
     */
    public Log generateShipLog(Ship ship, String key) {
        String text = getFlavor(key).replace("%%SHIP%%", ship.getName());
        logger.info(ship.getName() + " - Log entry: " + text);

        return new Log(Timestamp.from(Instant.now()), text);
    }
}
