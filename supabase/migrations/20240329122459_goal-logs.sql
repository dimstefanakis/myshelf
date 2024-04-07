create table "public"."goal_logs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "unit_amount" numeric,
    "goal" uuid
);


CREATE UNIQUE INDEX goal_logs_pkey ON public.goal_logs USING btree (id);

alter table "public"."goal_logs" add constraint "goal_logs_pkey" PRIMARY KEY using index "goal_logs_pkey";

alter table "public"."goal_logs" add constraint "goal_logs_goal_fkey" FOREIGN KEY (goal) REFERENCES goals(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."goal_logs" validate constraint "goal_logs_goal_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.insert_user_goals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Insert 7 goals with ENUM values for the newly created user
  INSERT INTO public.goals ("user", time_type, type, unit_amount) VALUES
  (NEW.id, 'daily', 'exercise', 10),
  (NEW.id, 'weekly', 'study', 20),
  (NEW.id, 'monthly', 'meditation', 30),
  (NEW.id, 'daily', 'exercise', 40),
  (NEW.id, 'weekly', 'study', 50),
  (NEW.id, 'monthly', 'meditation', 60),
  (NEW.id, 'daily', 'exercise', 70);
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."goal_logs" to "anon";

grant insert on table "public"."goal_logs" to "anon";

grant references on table "public"."goal_logs" to "anon";

grant select on table "public"."goal_logs" to "anon";

grant trigger on table "public"."goal_logs" to "anon";

grant truncate on table "public"."goal_logs" to "anon";

grant update on table "public"."goal_logs" to "anon";

grant delete on table "public"."goal_logs" to "authenticated";

grant insert on table "public"."goal_logs" to "authenticated";

grant references on table "public"."goal_logs" to "authenticated";

grant select on table "public"."goal_logs" to "authenticated";

grant trigger on table "public"."goal_logs" to "authenticated";

grant truncate on table "public"."goal_logs" to "authenticated";

grant update on table "public"."goal_logs" to "authenticated";

grant delete on table "public"."goal_logs" to "service_role";

grant insert on table "public"."goal_logs" to "service_role";

grant references on table "public"."goal_logs" to "service_role";

grant select on table "public"."goal_logs" to "service_role";

grant trigger on table "public"."goal_logs" to "service_role";

grant truncate on table "public"."goal_logs" to "service_role";

grant update on table "public"."goal_logs" to "service_role";


