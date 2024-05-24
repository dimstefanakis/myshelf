alter table "public"."users" add column "reminder_time" time with time zone default '12:00:00+02'::time with time zone;

create policy "update_own_user"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "enable delete"
on "public"."users_books"
as permissive
for delete
to authenticated
using (true);



