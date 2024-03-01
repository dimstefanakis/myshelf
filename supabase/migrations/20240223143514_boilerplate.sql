create table "public"."books" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text,
    "cover_url" text
);


alter table "public"."books" enable row level security;

create table "public"."journals" (
    "id" uuid not null default gen_random_uuid(),
    "users_book" uuid,
    "created_at" timestamp with time zone not null default now(),
    "title" text,
    "description" text,
    "image_url" text
);


alter table "public"."journals" enable row level security;

create table "public"."notes" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "users_book" uuid,
    "user" uuid,
    "title" text,
    "description" text
);


alter table "public"."notes" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "full_name" text,
    "avatar_url" text,
    "billing_address" jsonb,
    "payment_method" jsonb
);


alter table "public"."users" enable row level security;

create table "public"."users_books" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "book" uuid,
    "status" text
);


alter table "public"."users_books" enable row level security;

CREATE UNIQUE INDEX books_pkey ON public.books USING btree (id);

CREATE UNIQUE INDEX journals_pkey ON public.journals USING btree (id);

CREATE UNIQUE INDEX notes_pkey ON public.notes USING btree (id);

CREATE UNIQUE INDEX users_books_pkey ON public.users_books USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."books" add constraint "books_pkey" PRIMARY KEY using index "books_pkey";

alter table "public"."journals" add constraint "journals_pkey" PRIMARY KEY using index "journals_pkey";

alter table "public"."notes" add constraint "notes_pkey" PRIMARY KEY using index "notes_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."users_books" add constraint "users_books_pkey" PRIMARY KEY using index "users_books_pkey";

alter table "public"."journals" add constraint "journals_users_book_fkey" FOREIGN KEY (users_book) REFERENCES users_books(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."journals" validate constraint "journals_users_book_fkey";

alter table "public"."notes" add constraint "notes_user_fkey" FOREIGN KEY ("user") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."notes" validate constraint "notes_user_fkey";

alter table "public"."notes" add constraint "notes_users_book_fkey" FOREIGN KEY (users_book) REFERENCES users_books(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."notes" validate constraint "notes_users_book_fkey";

alter table "public"."users_books" add constraint "users_books_book_fkey" FOREIGN KEY (book) REFERENCES books(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users_books" validate constraint "users_books_book_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$function$
;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


grant delete on table "public"."books" to "anon";

grant insert on table "public"."books" to "anon";

grant references on table "public"."books" to "anon";

grant select on table "public"."books" to "anon";

grant trigger on table "public"."books" to "anon";

grant truncate on table "public"."books" to "anon";

grant update on table "public"."books" to "anon";

grant delete on table "public"."books" to "authenticated";

grant insert on table "public"."books" to "authenticated";

grant references on table "public"."books" to "authenticated";

grant select on table "public"."books" to "authenticated";

grant trigger on table "public"."books" to "authenticated";

grant truncate on table "public"."books" to "authenticated";

grant update on table "public"."books" to "authenticated";

grant delete on table "public"."books" to "service_role";

grant insert on table "public"."books" to "service_role";

grant references on table "public"."books" to "service_role";

grant select on table "public"."books" to "service_role";

grant trigger on table "public"."books" to "service_role";

grant truncate on table "public"."books" to "service_role";

grant update on table "public"."books" to "service_role";

grant delete on table "public"."journals" to "anon";

grant insert on table "public"."journals" to "anon";

grant references on table "public"."journals" to "anon";

grant select on table "public"."journals" to "anon";

grant trigger on table "public"."journals" to "anon";

grant truncate on table "public"."journals" to "anon";

grant update on table "public"."journals" to "anon";

grant delete on table "public"."journals" to "authenticated";

grant insert on table "public"."journals" to "authenticated";

grant references on table "public"."journals" to "authenticated";

grant select on table "public"."journals" to "authenticated";

grant trigger on table "public"."journals" to "authenticated";

grant truncate on table "public"."journals" to "authenticated";

grant update on table "public"."journals" to "authenticated";

grant delete on table "public"."journals" to "service_role";

grant insert on table "public"."journals" to "service_role";

grant references on table "public"."journals" to "service_role";

grant select on table "public"."journals" to "service_role";

grant trigger on table "public"."journals" to "service_role";

grant truncate on table "public"."journals" to "service_role";

grant update on table "public"."journals" to "service_role";

grant delete on table "public"."notes" to "anon";

grant insert on table "public"."notes" to "anon";

grant references on table "public"."notes" to "anon";

grant select on table "public"."notes" to "anon";

grant trigger on table "public"."notes" to "anon";

grant truncate on table "public"."notes" to "anon";

grant update on table "public"."notes" to "anon";

grant delete on table "public"."notes" to "authenticated";

grant insert on table "public"."notes" to "authenticated";

grant references on table "public"."notes" to "authenticated";

grant select on table "public"."notes" to "authenticated";

grant trigger on table "public"."notes" to "authenticated";

grant truncate on table "public"."notes" to "authenticated";

grant update on table "public"."notes" to "authenticated";

grant delete on table "public"."notes" to "service_role";

grant insert on table "public"."notes" to "service_role";

grant references on table "public"."notes" to "service_role";

grant select on table "public"."notes" to "service_role";

grant trigger on table "public"."notes" to "service_role";

grant truncate on table "public"."notes" to "service_role";

grant update on table "public"."notes" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."users_books" to "anon";

grant insert on table "public"."users_books" to "anon";

grant references on table "public"."users_books" to "anon";

grant select on table "public"."users_books" to "anon";

grant trigger on table "public"."users_books" to "anon";

grant truncate on table "public"."users_books" to "anon";

grant update on table "public"."users_books" to "anon";

grant delete on table "public"."users_books" to "authenticated";

grant insert on table "public"."users_books" to "authenticated";

grant references on table "public"."users_books" to "authenticated";

grant select on table "public"."users_books" to "authenticated";

grant trigger on table "public"."users_books" to "authenticated";

grant truncate on table "public"."users_books" to "authenticated";

grant update on table "public"."users_books" to "authenticated";

grant delete on table "public"."users_books" to "service_role";

grant insert on table "public"."users_books" to "service_role";

grant references on table "public"."users_books" to "service_role";

grant select on table "public"."users_books" to "service_role";

grant trigger on table "public"."users_books" to "service_role";

grant truncate on table "public"."users_books" to "service_role";

grant update on table "public"."users_books" to "service_role";
