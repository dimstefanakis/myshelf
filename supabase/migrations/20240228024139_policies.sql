alter table "public"."users_books" add column "user" uuid;

alter table "public"."users_books" enable row level security;

alter table "public"."users_books" add constraint "users_books_user_fkey" FOREIGN KEY ("user") REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."users_books" validate constraint "users_books_user_fkey";

create policy "Enable insert for authenticated users only"
on "public"."users_books"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."users_books"
as permissive
for select
to public
using (true);



