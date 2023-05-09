package org.tt.field.core;

import static java.util.Map.entry;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Map.Entry;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Log;
import org.tt.field.domain.Ship;

public class LogDistributor {

    private static final Logger logger = LoggerFactory.getLogger(LogDistributor.class);

    private static final String BASE_PATH = "src/main/resources/";
    private static final Map<String, String> FILE_PATHS = Map.ofEntries(
        entry("dry_dock_flavor", BASE_PATH + "core/dry_dock_flavor.txt"),
        entry("dry_dock_finish_flavor", BASE_PATH + "core/dry_dock_finish_flavor.txt"),
        entry("landing_flavor", BASE_PATH + "core/landing_flavor.txt"),
        entry("landing_broken_flavor", BASE_PATH + "core/landing_broken_flavor.txt"),
        entry("landing_crashed_flavor", BASE_PATH + "core/landing_crashed_flavor.txt"),
        entry("launch_site_flavor", BASE_PATH + "core/launch_site_flavor.txt"),
        entry("launch_site_finish_flavor", BASE_PATH + "core/launch_site_finish_flavor.txt"),
        entry("transit_ship_flavor", BASE_PATH + "core/transit_ship_flavor.txt")
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
            Path path = Paths.get(filePath);
            try (Stream<String> lines = Files.lines(path)) {
                lines.forEachOrdered(line -> contents.add(line));
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
