CREATE TABLE IF NOT EXISTS question (
  id UUID NOT NULL,
  content TEXT NOT NULL,
  score INT NOT NULL,
  PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS answer (
  id UUID NOT NULL,
  question_id UUID NOT NULL,
  content TEXT NOT NULL,
  CONSTRAINT fk_question
    FOREIGN KEY(question_id) 
      REFERENCES question(id)
);
