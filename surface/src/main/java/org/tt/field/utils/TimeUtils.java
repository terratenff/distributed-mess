package org.tt.field.utils;

import java.sql.Timestamp;

/**
 * Utility functions for timestamps.
 * 
 * @author terratenff
 */
public class TimeUtils {

    /**
     * Convert string-formatted timestamp into a Timestamp object.
     * @param str String timestamp. Example: "2023-10-28T11:43:41.657Z"
     * @return Timestamp object from specified string timestamp.
     */
    public static Timestamp toTimestamp(String str) {
        String formattedDate = str
            .replace("T", " ")
            .replace("Z", "");
        return Timestamp.valueOf(formattedDate);
    }
}