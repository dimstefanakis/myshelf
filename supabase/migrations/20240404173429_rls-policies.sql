drop policy "Enable read access for all users" on "public"."users_books";

alter table "public"."book_origins" enable row level security;

alter table "public"."book_tags" enable row level security;

alter table "public"."goal_logs" enable row level security;

alter table "public"."goals" enable row level security;

alter table "public"."habit_colors" enable row level security;

alter table "public"."habit_logs" enable row level security;

alter table "public"."habits" enable row level security;

alter table "public"."journals" enable row level security;

alter table "public"."notes" enable row level security;

alter table "public"."quotes" enable row level security;

alter table "public"."tags" enable row level security;

alter table "public"."users" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.insert_user_habits_and_colors()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  habit_id_read UUID;
  habit_id_stress UUID;
  habit_id_distractions UUID;
begin
  -- Insert the "Read today" habit and capture its ID
  INSERT INTO public.habits (name, "user") VALUES ('Read today', NEW.id)
  RETURNING id INTO habit_id_read;

  -- Insert the "Stress" habit and capture its ID
  INSERT INTO public.habits (name, "user") VALUES ('Stress', NEW.id)
  RETURNING id INTO habit_id_stress;

  -- Insert the "Distractions" habit and capture its ID
  INSERT INTO public.habits (name, "user") VALUES ('Distractions', NEW.id)
  RETURNING id INTO habit_id_distractions;

  -- Insert colors for the "Read today" habit
  INSERT INTO public.habit_colors (habit, color_code, description) VALUES
  (habit_id_read, '#FD3232', 'No I didn''t read'),
  (habit_id_read, '#FDBD5B', 'Medium reading'),
  (habit_id_read, '#44BD00', 'Yes I read');

  -- Insert colors for the "Stress" habit
  INSERT INTO public.habit_colors (habit, color_code, description) VALUES
  (habit_id_stress, '#FD3232', 'Bad stress'),
  (habit_id_stress, '#FDBD5B', 'Medium stress'),
  (habit_id_stress, '#44BD00', 'No stress');

  -- Insert colors for the "Distractions" habit
  INSERT INTO public.habit_colors (habit, color_code, description) VALUES
  (habit_id_distractions, '#FD3232', 'Many distractions'),
  (habit_id_distractions, '#FDBD5B', 'Medium distractions'),
  (habit_id_distractions, '#44BD00', 'No distractions');

  RETURN NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_user_goals()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  INSERT INTO public.goals ("user", time_type, type, unit_amount) VALUES
  (NEW.id, 'daily', 'pages', 10),
  (NEW.id, 'daily', 'minutes', 30),
  (NEW.id, 'weekly', 'days', 7),
  (NEW.id, 'weekly', 'pages', 70),
  (NEW.id, 'monthly', 'books', 1),
  (NEW.id, 'monthly', 'days', 30),
  (NEW.id, 'yearly', 'books', 12);
  RETURN NEW;
end;
$function$
;

create policy "delete_own_book_origins"
on "public"."book_origins"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = book_origins.user_book) AND (users_books."user" = auth.uid())))));


create policy "insert_book_origins"
on "public"."book_origins"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = book_origins.user_book) AND (users_books."user" = auth.uid())))));


create policy "select_own_book_origins"
on "public"."book_origins"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = book_origins.user_book) AND (users_books."user" = auth.uid())))));


create policy "update_own_book_origins"
on "public"."book_origins"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = book_origins.user_book) AND (users_books."user" = auth.uid())))));


create policy "Enable insert for authenticated users only"
on "public"."book_tags"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."book_tags"
as permissive
for select
to public
using (true);


create policy "delete_own_goal_logs"
on "public"."goal_logs"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM goals
  WHERE ((goals.id = goal_logs.goal) AND (goals."user" = auth.uid())))));


create policy "insert_goal_logs"
on "public"."goal_logs"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM goals
  WHERE ((goals.id = goal_logs.goal) AND (goals."user" = auth.uid())))));


create policy "select_own_goal_logs"
on "public"."goal_logs"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM goals
  WHERE ((goals.id = goal_logs.goal) AND (goals."user" = auth.uid())))));


create policy "update_own_goal_logs"
on "public"."goal_logs"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM goals
  WHERE ((goals.id = goal_logs.goal) AND (goals."user" = auth.uid())))));


create policy "delete_own_goals"
on "public"."goals"
as permissive
for delete
to public
using (("user" = auth.uid()));


create policy "insert_goals"
on "public"."goals"
as permissive
for insert
to public
with check (("user" = auth.uid()));


create policy "select_own_goals"
on "public"."goals"
as permissive
for select
to public
using (("user" = auth.uid()));


create policy "update_own_goals"
on "public"."goals"
as permissive
for update
to public
using (("user" = auth.uid()));


create policy "delete_own_habit_colors"
on "public"."habit_colors"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM habits
  WHERE ((habits.id = habit_colors.habit) AND (habits."user" = auth.uid())))));


create policy "insert_habit_colors"
on "public"."habit_colors"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM habits
  WHERE ((habits.id = habit_colors.habit) AND (habits."user" = auth.uid())))));


create policy "select_own_habit_colors"
on "public"."habit_colors"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM habits
  WHERE ((habits.id = habit_colors.habit) AND (habits."user" = auth.uid())))));


create policy "update_own_habit_colors"
on "public"."habit_colors"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM habits
  WHERE ((habits.id = habit_colors.habit) AND (habits."user" = auth.uid())))));


create policy "Enable insert for authenticated users only"
on "public"."habit_logs"
as permissive
for insert
to authenticated
with check (true);


create policy "delete_own_habit_logs"
on "public"."habit_logs"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM (habit_colors
     JOIN habits ON ((habits.id = habit_colors.habit)))
  WHERE ((habit_colors.id = habit_logs.habit_color) AND (habits."user" = auth.uid())))));


create policy "select_own_habit_logs"
on "public"."habit_logs"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (habit_colors
     JOIN habits ON ((habits.id = habit_colors.habit)))
  WHERE ((habit_colors.id = habit_logs.habit_color) AND (habits."user" = auth.uid())))));


create policy "update_own_habit_logs"
on "public"."habit_logs"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM (habit_colors
     JOIN habits ON ((habits.id = habit_colors.habit)))
  WHERE ((habit_colors.id = habit_logs.habit_color) AND (habits."user" = auth.uid())))));


create policy "delete_own_habits"
on "public"."habits"
as permissive
for delete
to public
using (("user" = auth.uid()));


create policy "insert_habits"
on "public"."habits"
as permissive
for insert
to public
with check (("user" = auth.uid()));


create policy "select_own_habits"
on "public"."habits"
as permissive
for select
to public
using (("user" = auth.uid()));


create policy "update_own_habits"
on "public"."habits"
as permissive
for update
to public
using (("user" = auth.uid()));


create policy "Enable insert for authenticated users only"
on "public"."journals"
as permissive
for insert
to authenticated
with check (true);


create policy "delete_own_journals"
on "public"."journals"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = journals.users_book) AND (users_books."user" = auth.uid())))));


create policy "select_own_journals"
on "public"."journals"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = journals.users_book) AND (users_books."user" = auth.uid())))));


create policy "update_own_journals"
on "public"."journals"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = journals.users_book) AND (users_books."user" = auth.uid())))));


create policy "Enable insert for authenticated users only"
on "public"."notes"
as permissive
for insert
to authenticated
with check (true);


create policy "delete_own_notes"
on "public"."notes"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = notes.users_book) AND (users_books."user" = auth.uid())))));


create policy "select_own_notes"
on "public"."notes"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = notes.users_book) AND (users_books."user" = auth.uid())))));


create policy "update_own_notes"
on "public"."notes"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = notes.users_book) AND (users_books."user" = auth.uid())))));


create policy "Enable insert for authenticated users only"
on "public"."quotes"
as permissive
for insert
to authenticated
with check (true);


create policy "delete_own_quotes"
on "public"."quotes"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = quotes.users_book) AND (users_books."user" = auth.uid())))));


create policy "select_own_quotes"
on "public"."quotes"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = quotes.users_book) AND (users_books."user" = auth.uid())))));


create policy "update_own_quotes"
on "public"."quotes"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM users_books
  WHERE ((users_books.id = quotes.users_book) AND (users_books."user" = auth.uid())))));


create policy "Enable insert for authenticated users only"
on "public"."tags"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for all users"
on "public"."tags"
as permissive
for select
to public
using (true);


create policy "Enable read access for this user"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "select_own_books"
on "public"."users_books"
as permissive
for select
to public
using (("user" = auth.uid()));



