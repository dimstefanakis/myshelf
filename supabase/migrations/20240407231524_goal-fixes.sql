drop policy "insert_goal_logs" on "public"."goal_logs";

drop policy "select_own_goal_logs" on "public"."goal_logs";

alter table "public"."goal_logs" add column "type" text;

alter table "public"."goal_logs" add column "user" uuid;

alter table "public"."goal_logs" add constraint "goal_logs_user_fkey" FOREIGN KEY ("user") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."goal_logs" validate constraint "goal_logs_user_fkey";

create policy "insert_goal_logs"
on "public"."goal_logs"
as permissive
for insert
to public
with check (("user" = auth.uid()));


create policy "select_own_goal_logs"
on "public"."goal_logs"
as permissive
for select
to public
using (("user" = auth.uid()));



