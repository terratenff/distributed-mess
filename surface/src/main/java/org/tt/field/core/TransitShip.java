package org.tt.field.core;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Mission;
import org.tt.field.domain.Ship;

public class TransitShip extends Thread {

    private static final Logger logger = LoggerFactory.getLogger(TransitShip.class);
    private static final int TRANSIT_TIME = 60000;
    private static final int RETRY_TIME = 10000;
    private static final int RETRY_CONNECTION_COUNT = 5;
    private static final double CONDITION_DEGRADATION_RATE = 0.10;
    private static final int CONDITION_DEGRADATION_FREQUENCY = 1000;

    private static List<TransitShip> shipsOnTransit = new ArrayList<TransitShip>();

    public static boolean abortMission(Ship ship) {
        cleanup();

        TransitShip targetShip = null;
        for (TransitShip transitShip : shipsOnTransit) {
            if (transitShip.ship.getId() == ship.getId()) {
                targetShip = transitShip;
                break;
            }
        }

        if (targetShip != null) {
            targetShip.abortMission = true;
            return true;
        } else {
            return false;
        }
    }

    public static void cleanup() {
        int i = 0;
        while (i < shipsOnTransit.size()) {
            TransitShip transitShip = shipsOnTransit.get(i);
            if (transitShip.concluded) {
                shipsOnTransit.remove(i);
            } else {
                i++;
            }
        }
    }

    private Ship ship;
    private Function<Ship, Ship> saveShipToRepository;
    private Function<Mission, Mission> saveMissionToRepository;
    private Random random = new Random();
    private boolean abortMission = false;
    private boolean concluded = false;
    private boolean missionCompleted = true;

    public TransitShip(Ship ship, Function<Ship, Ship> saveShipToRepository, Function<Mission, Mission> saveMissionToRepository) {
        this.ship = ship;
        this.saveShipToRepository = saveShipToRepository;
        this.saveMissionToRepository = saveMissionToRepository;

        shipsOnTransit.add(this);
    }

    public void run() {
        try {
            while (true) {
                wait(TRANSIT_TIME);

                if (ship.getStatus().equals("OUTBOUND")) {
                    boolean continueMission = wait(TRANSIT_TIME);

                    if (!continueMission) {
                        missionCompleted = false;
                        logger.warn("Ship with ID " + ship.getId() + " has aborted its mission. It is returning now.");
                        ship.setStatus("INBOUND");
                        ship = saveShipToRepository.apply(ship);

                        continue;
                    }

                    // TODO: Contact space module.
                    
                    logger.warn("Ship with ID " + ship.getId() + " is making an unexpected return trip.");
                    ship.setStatus("INBOUND");
                    ship = saveShipToRepository.apply(ship);
                } else if (ship.getStatus().equals("INBOUND")) {
                    wait(TRANSIT_TIME);
                    logger.info("Ship with ID " + ship.getId() + " attempting to land.");
                    ship.setStatus("LANDING");
                    ship = saveShipToRepository.apply(ship);
                    wait(TRANSIT_TIME);
                    String shipStatus;
                    if (ship.getCondition() == 0) {
                        logger.info("Ship with ID " + ship.getId() + " has crashed.");
                        shipStatus = "CRASHED";
                    } else if (ship.getCondition() < (ship.getPeakCondition() / 10)) {
                        logger.info("Ship with ID " + ship.getId() + " has landed in a broken state.");
                        shipStatus = "BROKEN";
                    } else {
                        logger.info("Ship with ID " + ship.getId() + " has landed.");
                        shipStatus = "READY";
                    }
                    Mission mission = ship.getMission();
                    mission.setCompleted(missionCompleted);
                    mission.setArrivalTime(Timestamp.from(Instant.now()));
                    saveMissionToRepository.apply(mission);
                    
                    ship.getPastMissions().add(mission);
                    ship.setStatus(shipStatus);
                    ship.setMission(null);
                    ship = saveShipToRepository.apply(ship);

                    concluded = true;
                    return;
                }
            }
            
        } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        
    }

    private boolean wait(int time) throws InterruptedException {
        for (int i = 0; i < time / CONDITION_DEGRADATION_FREQUENCY; i++) {
            Thread.sleep(CONDITION_DEGRADATION_FREQUENCY);
            double degradationRoll = random.nextDouble();
            if (degradationRoll < CONDITION_DEGRADATION_RATE && ship.getCondition() > 0) {
                ship.setCondition(ship.getCondition() - 1);
                ship = saveShipToRepository.apply(ship);
            }

            if (abortMission && ship.getStatus().equals("OUTBOUND")) {
                return false;
            }
        }
        return true;
    }
}
