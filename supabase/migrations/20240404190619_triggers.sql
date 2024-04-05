create trigger on_auth_user_created_insert_goals
  after insert on auth.users
  for each row execute procedure public.insert_user_goals();

create trigger trigger_insert_user_habits_and_colors
  after insert on auth.users
  for each row execute procedure public.insert_user_habits_and_colors();
