set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.insert_user_goals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Insert 7 goals with ENUM values for the newly created user
  INSERT INTO public.goals ("user", time_type, type, unit_amount) VALUES
  (NEW.id, 'daily', 'pages', 10),
  (NEW.id, 'daily', 'minutes', 30),
  (NEW.id, 'weekly', 'days', 7),
  (NEW.id, 'weekly', 'pages', 70),
  (NEW.id, 'monthly', 'books', 1),
  (NEW.id, 'monthly', 'days', 30),
  (NEW.id, 'yearly', 'books', 12);
  RETURN NEW;
END;
$function$
;


