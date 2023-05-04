package org.tt.field.core;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedList;
import java.util.Queue;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Mission;
import org.tt.field.domain.Ship;

public class LaunchSite {

    private static final Logger logger = LoggerFactory.getLogger(LaunchSite.class);
    private static LaunchSite instance;
    
    private static final int IDLE_TIME = 10000;
    private static final int LAUNCH_TIME = 15000;
    
    public static LaunchSite getInstance() {
        if (instance == null) {
            instance = new LaunchSite();
        }
        return instance;
    }

    private Function<Ship, Ship> saveShipToRepository;
    private Function<Mission, Mission> saveMissionToRepository;

    private Thread launchSiteThread;
    private Queue<Ship> launchQueue = new LinkedList<Ship>();
    private Ship targetShip;
    private boolean initialized = false;
    private boolean interruptionRequested = false;

    public int addToQueue(Ship ship) throws IllegalStateException {
        if (!initialized) {
            throw new IllegalStateException("Launch site has not been initialized.");
        }
        ship.setStatus("AWAITING_TAKEOFF (" + (launchQueue.size() + 1) + ")");
        launchQueue.add(saveShipToRepository.apply(ship));
        logger.info("A ship was added to queue. Queue size: " + launchQueue.size());
        return launchQueue.size();
    }

    public int getShipNumber(int shipId) {
        int i = 0;

        for (Ship ship : launchQueue) {
            if (ship.getId() == shipId) return i + 1;
            i++;
        }

        return -1;
    }

    public void initialize(Function<Ship, Ship> callbackShip, Function<Mission, Mission> callbackMission) {
        saveShipToRepository = callbackShip;
        saveMissionToRepository = callbackMission;
        logger.info("Setting up launch site...");
        launchSiteThread = new Thread(() -> {
            try {
                launchCore();
            } catch (InterruptedException e) {
                logger.error("Something went wrong with launch site thread: " + e.getMessage());
            }
        });
        launchSiteThread.start();
        initialized = true;
    }

    public boolean isInitialized() {
        return initialized;
    }

    public void requestInterruption() {
        interruptionRequested = true;
    }

    private void launchCore() throws InterruptedException {
        logger.info("Launch site is now open.");
        while (true) {
            Thread.sleep(IDLE_TIME);
            if (targetShip == null) {
                targetShip = launchQueue.poll();
                if (targetShip != null) {
                    targetShip.setStatus("AWAITING_TAKEOFF (Next)");
                    targetShip = saveShipToRepository.apply(targetShip);
                    updateQueueShipStatus();
                }
            } else if (targetShip.getStatus().startsWith("AWAITING_TAKEOFF")) {
                targetShip.setStatus("TAKING_OFF");
                targetShip = saveShipToRepository.apply(targetShip);
            } else {
                logger.info("Ship with ID " + targetShip.getId() + " is taking off.");
                Thread.sleep(LAUNCH_TIME);
                Mission mission = targetShip.getMission();
                mission.setDepartureTime(Timestamp.from(Instant.now()));
                saveMissionToRepository.apply(mission);
                targetShip.setStatus("OUTBOUND");
                targetShip = saveShipToRepository.apply(targetShip);
                (new TransitShip(targetShip, saveShipToRepository, saveMissionToRepository)).start();
                logger.info("Ship with ID " + targetShip.getId() + " has finished taking off.");
                targetShip = null;
            }
        }
    }

    private void updateQueueShipStatus() {
        int i = 1;
        for (Ship ship : launchQueue) {
            ship.setStatus("AWAITING_TAKEOFF (" + i + ")");
            saveShipToRepository.apply(ship);
            i++;
        }
    }
}
