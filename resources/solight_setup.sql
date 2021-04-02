CREATE TABLE IF NOT EXISTS question (
  id UUID NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  ts TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS answer (
  id UUID NOT NULL,
  question_id UUID NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  ts TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id),
  CONSTRAINT fk_question
    FOREIGN KEY(question_id) 
      REFERENCES question(id)
);

CREATE TABLE IF NOT EXISTS souser (
  id UUID NOT NULL,
  sub TEXT NOT NULL,
  PRIMARY KEY (id)
);
