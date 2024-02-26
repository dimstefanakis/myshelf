alter table "public"."books" add column "google_api_data" jsonb;

alter table "public"."books" add column "isbn_10" text;

alter table "public"."books" add column "isbn_13" text;

CREATE UNIQUE INDEX books_isbn_10_key ON public.books USING btree (isbn_10);

CREATE UNIQUE INDEX books_isbn_13_key ON public.books USING btree (isbn_13);

alter table "public"."books" add constraint "books_isbn_10_key" UNIQUE using index "books_isbn_10_key";

alter table "public"."books" add constraint "books_isbn_13_key" UNIQUE using index "books_isbn_13_key";


