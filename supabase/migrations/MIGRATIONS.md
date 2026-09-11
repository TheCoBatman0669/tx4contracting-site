# Applied migrations

These nine migrations are already applied to the live project. They are listed
here for reference; the authoritative record is Supabase's own migration table.
If you need the exact SQL for any of them, pull it with the Supabase CLI:

    supabase link --project-ref jhcyijhcdjgnrcurpyzn
    supabase db pull

| Version | Name |
|---|---|
| 20260908200722 | create_inquiry_enums_and_admin_users |
| 20260908200737 | create_inquiries_table |
| 20260908200749 | create_inquiry_files_events_and_attempts |
| 20260908200806 | enable_rls_deny_by_default |
| 20260908200818 | create_reference_number_and_event_functions |
| 20260908200826 | create_private_attachments_bucket |
| 20260908200840 | create_retention_purge |
| 20260908200856 | schedule_retention_jobs |
| 20260908201427 | restrict_helper_function_grants |

Do not re-run these by hand against the live project. Applying them a second
time will fail on the `create type` and `create table` statements.