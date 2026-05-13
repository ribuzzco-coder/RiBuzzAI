-- =========================================================
-- Extender el conteo de preguntas de 32 a 40
-- (nuevo blueprint v2: 9 bloques A-I, 40 preguntas)
-- =========================================================

-- 1. Cambiar constraint en diagnostics.current_question
alter table public.diagnostics
  drop constraint if exists diagnostics_current_question_check;

alter table public.diagnostics
  add constraint diagnostics_current_question_check
  check (current_question between 1 and 40);

-- 2. Cambiar constraint en diagnostic_answers.question_number
alter table public.diagnostic_answers
  drop constraint if exists diagnostic_answers_question_number_check;

alter table public.diagnostic_answers
  add constraint diagnostic_answers_question_number_check
  check (question_number between 1 and 40);
