/* Ship table initialization: any ships that are at 'surface' are kept there. */

DO '
    BEGIN
        IF EXISTS
            ( SELECT 1
              FROM information_schema.tables
            WHERE table_name = ''ship''
            )
        THEN
            UPDATE ship
            SET status = ''READY''
            WHERE
                status LIKE ''AWAITING%'' OR
                status = ''TAKING_OFF'' OR
                status = ''OUTBOUND'' OR
                status = ''INBOUND'' OR
                status = ''LANDING'' OR
                status = ''REPAIR_IN_PROGRESS'';
            UPDATE ship
            SET status = ''CRASHED''
            WHERE
                condition = 0;
            UPDATE ship
            SET status = ''BROKEN''
            WHERE
                condition > 0 AND
                condition < peak_condition / 10;
        END IF;
    END;
' LANGUAGE PLPGSQL;
