package org.tt.field.utils;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tt.field.domain.Ship;

/**
 * Utility class that is used to send a HTTP request to space module.
 * 
 * @author terratenff
 */
public class HttpUtils {

    private static final Logger logger = LoggerFactory.getLogger(HttpUtils.class);

    /**
     * Sends a ship to space module.
     * @param ship
     * @return true, if response code is OK.
     */
    public static boolean sendShip(Ship ship) {
        try {
            String spaceUrl = PropertyUtils.getSpaceUrl();
            URL url = new URL("http://" + spaceUrl + "/ships");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Host", spaceUrl);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setDoOutput(true);

            String jsonString = ship.toJson().replaceAll("\"", "\\\"");
            OutputStream os = conn.getOutputStream();
            byte[] input = jsonString.getBytes("utf-8");
            os.write(input, 0, input.length);

            int responseCode = conn.getResponseCode();

            return responseCode >= 200 && responseCode < 300;
            
        } catch (ConnectException e) {
            return false;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * @param paramsStr URL parameters are expected. For example, "?page=1".
     * @return JSON-formatted object of ships that could be found from the
     * space module. Keys represent IDs of the ships, and values are the
     * ships.
     */
    public static JSONObject getShips(String paramsStr) {
        return getObjects("/ships", paramsStr);
    }

    /**
     * @param paramsStr URL parameters are expected. For example, "?page=1".
     * @return
     */
    public static JSONArray getLogs(String paramsStr) {
        return getObjectsArray("/ships/logs", paramsStr);
    }

    /**
     * @param paramsStr URL parameters are expected. For example, "?page=1".
     * @return
     */
    public static JSONArray getMissions(String paramsStr) {
        return getObjectsArray("/ships/missions", paramsStr);
    }

    /**
     * @param paramsStr URL parameters are expected. For example, "?page=1".
     * @return
     */
    public static JSONArray getEvents(String paramsStr) {
        return getObjectsArray("/ships/mission-events", paramsStr);
    }

    /**
     * Fetches data objects from the space module. Use this if a JSONObject
     * is expected.
     * @param spaceUrl URL subpage. For example, "/ships".
     * @param paramsStr URL parameters are expected. For example, "?page=1".
     * @return Data objects that could be found from the space module
     * using specified URL.
     */
    private static JSONObject getObjects(String spaceUrl, String paramsStr) {
        try {
            String spaceBaseUrl = PropertyUtils.getSpaceUrl();
            URL url = new URL("http://" + spaceBaseUrl + spaceUrl + paramsStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Host", spaceUrl);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setDoOutput(true);

            int responseCode = conn.getResponseCode();

            if (responseCode >= 200 && responseCode < 300) {
                InputStream stream = conn.getInputStream();
                String result = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
                return new JSONObject(result);
            } else {
                return null;
            }

        } catch (ConnectException e) {
            return null;
        } catch (IOException e) {
            return null;
        }
    }

    /**
     * Fetches data objects from the space module. Use this if a JSONArray
     * is expected.
     * @param spaceUrl URL subpage. For example, "/ships".
     * @param paramsStr URL parameters are expected. For example, "?page=1".
     * @return Data objects that could be found from the space module
     * using specified URL.
     */
    private static JSONArray getObjectsArray(String spaceUrl, String paramsStr) {
        try {
            String spaceBaseUrl = PropertyUtils.getSpaceUrl();
            URL url = new URL("http://" + spaceBaseUrl + spaceUrl + paramsStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Host", spaceUrl);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setDoOutput(true);

            int responseCode = conn.getResponseCode();

            if (responseCode >= 200 && responseCode < 300) {
                InputStream stream = conn.getInputStream();
                String result = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
                return new JSONArray(result);
            } else {
                return null;
            }

        } catch (ConnectException e) {
            return null;
        } catch (IOException e) {
            return null;
        }
    }
}
