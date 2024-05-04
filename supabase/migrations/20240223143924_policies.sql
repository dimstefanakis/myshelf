alter table "public"."journals" disable row level security;

alter table "public"."notes" disable row level security;

alter table "public"."users" disable row level security;

alter table "public"."users_books" disable row level security;

create policy "Enable insert for authenticated users only"
on "public"."books"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."books"
as permissive
for select
to public
using (true);



