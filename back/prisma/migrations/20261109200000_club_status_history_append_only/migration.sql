CREATE OR REPLACE FUNCTION "club_status_history_block_changes"()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Club_Status_History es un registro de auditoria de solo agregado';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "club_status_history_append_only"
BEFORE UPDATE OR DELETE ON "Club_Status_History"
FOR EACH ROW EXECUTE FUNCTION "club_status_history_block_changes"();

CREATE TRIGGER "club_status_history_no_truncate"
BEFORE TRUNCATE ON "Club_Status_History"
FOR EACH STATEMENT EXECUTE FUNCTION "club_status_history_block_changes"();