create table "public"."book_tags" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "book" uuid,
    "tag" uuid
);


create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text
);


CREATE UNIQUE INDEX book_tags_pkey ON public.book_tags USING btree (id);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

alter table "public"."book_tags" add constraint "book_tags_pkey" PRIMARY KEY using index "book_tags_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."book_tags" add constraint "book_tags_book_fkey" FOREIGN KEY (book) REFERENCES books(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."book_tags" validate constraint "book_tags_book_fkey";

alter table "public"."book_tags" add constraint "book_tags_tag_fkey" FOREIGN KEY (tag) REFERENCES tags(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."book_tags" validate constraint "book_tags_tag_fkey";

grant delete on table "public"."book_tags" to "anon";

grant insert on table "public"."book_tags" to "anon";

grant references on table "public"."book_tags" to "anon";

grant select on table "public"."book_tags" to "anon";

grant trigger on table "public"."book_tags" to "anon";

grant truncate on table "public"."book_tags" to "anon";

grant update on table "public"."book_tags" to "anon";

grant delete on table "public"."book_tags" to "authenticated";

grant insert on table "public"."book_tags" to "authenticated";

grant references on table "public"."book_tags" to "authenticated";

grant select on table "public"."book_tags" to "authenticated";

grant trigger on table "public"."book_tags" to "authenticated";

grant truncate on table "public"."book_tags" to "authenticated";

grant update on table "public"."book_tags" to "authenticated";

grant delete on table "public"."book_tags" to "service_role";

grant insert on table "public"."book_tags" to "service_role";

grant references on table "public"."book_tags" to "service_role";

grant select on table "public"."book_tags" to "service_role";

grant trigger on table "public"."book_tags" to "service_role";

grant truncate on table "public"."book_tags" to "service_role";

grant update on table "public"."book_tags" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";


