create table "public"."habit_colors" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "habit" uuid,
    "color_code" text,
    "description" text
);


create table "public"."habit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "habit_color" uuid
);


create table "public"."habits" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "user" uuid
);


CREATE UNIQUE INDEX habit_colors_pkey ON public.habit_colors USING btree (id);

CREATE UNIQUE INDEX habit_logs_pkey ON public.habit_logs USING btree (id);

CREATE UNIQUE INDEX habits_pkey ON public.habits USING btree (id);

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

alter table "public"."habit_colors" add constraint "habit_colors_pkey" PRIMARY KEY using index "habit_colors_pkey";

alter table "public"."habit_logs" add constraint "habit_logs_pkey" PRIMARY KEY using index "habit_logs_pkey";

alter table "public"."habits" add constraint "habits_pkey" PRIMARY KEY using index "habits_pkey";

alter table "public"."habit_colors" add constraint "habit_colors_habit_fkey" FOREIGN KEY (habit) REFERENCES habits(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."habit_colors" validate constraint "habit_colors_habit_fkey";

alter table "public"."habit_logs" add constraint "habit_logs_habit_color_fkey" FOREIGN KEY (habit_color) REFERENCES habit_colors(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."habit_logs" validate constraint "habit_logs_habit_color_fkey";

alter table "public"."habits" add constraint "habits_user_fkey" FOREIGN KEY ("user") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."habits" validate constraint "habits_user_fkey";

alter table "public"."tags" add constraint "tags_name_key" UNIQUE using index "tags_name_key";

grant delete on table "public"."habit_colors" to "anon";

grant insert on table "public"."habit_colors" to "anon";

grant references on table "public"."habit_colors" to "anon";

grant select on table "public"."habit_colors" to "anon";

grant trigger on table "public"."habit_colors" to "anon";

grant truncate on table "public"."habit_colors" to "anon";

grant update on table "public"."habit_colors" to "anon";

grant delete on table "public"."habit_colors" to "authenticated";

grant insert on table "public"."habit_colors" to "authenticated";

grant references on table "public"."habit_colors" to "authenticated";

grant select on table "public"."habit_colors" to "authenticated";

grant trigger on table "public"."habit_colors" to "authenticated";

grant truncate on table "public"."habit_colors" to "authenticated";

grant update on table "public"."habit_colors" to "authenticated";

grant delete on table "public"."habit_colors" to "service_role";

grant insert on table "public"."habit_colors" to "service_role";

grant references on table "public"."habit_colors" to "service_role";

grant select on table "public"."habit_colors" to "service_role";

grant trigger on table "public"."habit_colors" to "service_role";

grant truncate on table "public"."habit_colors" to "service_role";

grant update on table "public"."habit_colors" to "service_role";

grant delete on table "public"."habit_logs" to "anon";

grant insert on table "public"."habit_logs" to "anon";

grant references on table "public"."habit_logs" to "anon";

grant select on table "public"."habit_logs" to "anon";

grant trigger on table "public"."habit_logs" to "anon";

grant truncate on table "public"."habit_logs" to "anon";

grant update on table "public"."habit_logs" to "anon";

grant delete on table "public"."habit_logs" to "authenticated";

grant insert on table "public"."habit_logs" to "authenticated";

grant references on table "public"."habit_logs" to "authenticated";

grant select on table "public"."habit_logs" to "authenticated";

grant trigger on table "public"."habit_logs" to "authenticated";

grant truncate on table "public"."habit_logs" to "authenticated";

grant update on table "public"."habit_logs" to "authenticated";

grant delete on table "public"."habit_logs" to "service_role";

grant insert on table "public"."habit_logs" to "service_role";

grant references on table "public"."habit_logs" to "service_role";

grant select on table "public"."habit_logs" to "service_role";

grant trigger on table "public"."habit_logs" to "service_role";

grant truncate on table "public"."habit_logs" to "service_role";

grant update on table "public"."habit_logs" to "service_role";

grant delete on table "public"."habits" to "anon";

grant insert on table "public"."habits" to "anon";

grant references on table "public"."habits" to "anon";

grant select on table "public"."habits" to "anon";

grant trigger on table "public"."habits" to "anon";

grant truncate on table "public"."habits" to "anon";

grant update on table "public"."habits" to "anon";

grant delete on table "public"."habits" to "authenticated";

grant insert on table "public"."habits" to "authenticated";

grant references on table "public"."habits" to "authenticated";

grant select on table "public"."habits" to "authenticated";

grant trigger on table "public"."habits" to "authenticated";

grant truncate on table "public"."habits" to "authenticated";

grant update on table "public"."habits" to "authenticated";

grant delete on table "public"."habits" to "service_role";

grant insert on table "public"."habits" to "service_role";

grant references on table "public"."habits" to "service_role";

grant select on table "public"."habits" to "service_role";

grant trigger on table "public"."habits" to "service_role";

grant truncate on table "public"."habits" to "service_role";

grant update on table "public"."habits" to "service_role";


