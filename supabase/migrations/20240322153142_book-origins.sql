create table "public"."book_origins" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_book" uuid,
    "author_nationality_long" text,
    "author_nationality_lat" text,
    "setting_origin_long" text,
    "setting_origin_lat" text,
    "country_published_long" text,
    "country_published_lat" text
);


create table "public"."goals" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user" uuid,
    "time_type" text,
    "type" text,
    "unit_amount" numeric
);


CREATE UNIQUE INDEX book_origins_pkey ON public.book_origins USING btree (id);

CREATE UNIQUE INDEX goals_pkey ON public.goals USING btree (id);

alter table "public"."book_origins" add constraint "book_origins_pkey" PRIMARY KEY using index "book_origins_pkey";

alter table "public"."goals" add constraint "goals_pkey" PRIMARY KEY using index "goals_pkey";

alter table "public"."book_origins" add constraint "book_origins_user_book_fkey" FOREIGN KEY (user_book) REFERENCES users_books(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."book_origins" validate constraint "book_origins_user_book_fkey";

alter table "public"."goals" add constraint "goals_user_fkey" FOREIGN KEY ("user") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."goals" validate constraint "goals_user_fkey";

grant delete on table "public"."book_origins" to "anon";

grant insert on table "public"."book_origins" to "anon";

grant references on table "public"."book_origins" to "anon";

grant select on table "public"."book_origins" to "anon";

grant trigger on table "public"."book_origins" to "anon";

grant truncate on table "public"."book_origins" to "anon";

grant update on table "public"."book_origins" to "anon";

grant delete on table "public"."book_origins" to "authenticated";

grant insert on table "public"."book_origins" to "authenticated";

grant references on table "public"."book_origins" to "authenticated";

grant select on table "public"."book_origins" to "authenticated";

grant trigger on table "public"."book_origins" to "authenticated";

grant truncate on table "public"."book_origins" to "authenticated";

grant update on table "public"."book_origins" to "authenticated";

grant delete on table "public"."book_origins" to "service_role";

grant insert on table "public"."book_origins" to "service_role";

grant references on table "public"."book_origins" to "service_role";

grant select on table "public"."book_origins" to "service_role";

grant trigger on table "public"."book_origins" to "service_role";

grant truncate on table "public"."book_origins" to "service_role";

grant update on table "public"."book_origins" to "service_role";

grant delete on table "public"."goals" to "anon";

grant insert on table "public"."goals" to "anon";

grant references on table "public"."goals" to "anon";

grant select on table "public"."goals" to "anon";

grant trigger on table "public"."goals" to "anon";

grant truncate on table "public"."goals" to "anon";

grant update on table "public"."goals" to "anon";

grant delete on table "public"."goals" to "authenticated";

grant insert on table "public"."goals" to "authenticated";

grant references on table "public"."goals" to "authenticated";

grant select on table "public"."goals" to "authenticated";

grant trigger on table "public"."goals" to "authenticated";

grant truncate on table "public"."goals" to "authenticated";

grant update on table "public"."goals" to "authenticated";

grant delete on table "public"."goals" to "service_role";

grant insert on table "public"."goals" to "service_role";

grant references on table "public"."goals" to "service_role";

grant select on table "public"."goals" to "service_role";

grant trigger on table "public"."goals" to "service_role";

grant truncate on table "public"."goals" to "service_role";

grant update on table "public"."goals" to "service_role";


