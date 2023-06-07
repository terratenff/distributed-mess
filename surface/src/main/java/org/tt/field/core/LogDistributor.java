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

public class LogDistributor {

    private static final Logger logger = LoggerFactory.getLogger(LogDistributor.class);

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

    public static LogDistributor getInstance() {
        if (instance == null) {
            instance = new LogDistributor();
        }
        return instance;
    }

    private Map<String, List<String>> flavor;
    private Random random;
    
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

    public String getFlavor(String key) {
        return flavor.get(key).get(random.nextInt(flavor.get(key).size()));
    }

    public Log generateShipLog(Ship ship, String key) {
        String text = getFlavor(key).replace("%%SHIP%%", ship.getName());
        logger.info(ship.getName() + " - Log entry: " + text);

        return new Log(Timestamp.from(Instant.now()), text);
    }
}
